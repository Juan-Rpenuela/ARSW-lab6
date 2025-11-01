class InteractiveBlackboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentColor: '#000000',
            strokeWeight: 3,
            currentTool: 'pencil',
            connected: false,
            statusMessage: 'Connecting to server...'
        };
        
        this.canvasRef = React.createRef();
        this.stompClient = null;
        this.sketch = null;
        this.previousMouseX = 0;
        this.previousMouseY = 0;
        this.isDrawing = false;
    }

    componentDidMount() {
        this.initP5();
        this.connectWebSocket();
    }

    componentWillUnmount() {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.disconnect();
        }
        if (this.sketch) {
            this.sketch.remove();
        }
    }

    connectWebSocket = () => {
        const socket = new SockJS('/bbService');
        this.stompClient = Stomp.over(socket);
        
        this.stompClient.connect({}, 
            (frame) => {
                console.log('Connected: ' + frame);
                this.setState({ 
                    connected: true, 
                    statusMessage: 'Connected! You can draw now.' 
                });
                
                // Subscribe to drawing updates
                this.stompClient.subscribe('/topic/drawings', (message) => {
                    const drawingUpdate = JSON.parse(message.body);
                    this.drawLine(drawingUpdate);
                });

                // Subscribe to clear canvas events
                this.stompClient.subscribe('/topic/clear', (message) => {
                    if (this.sketch) {
                        this.sketch.clear();
                        this.sketch.background(255);
                    }
                });
            },
            (error) => {
                console.error('Connection error: ' + error);
                this.setState({ 
                    connected: false, 
                    statusMessage: 'Connection failed. Retrying...' 
                });
                setTimeout(() => this.connectWebSocket(), 3000);
            }
        );
    }

    initP5 = () => {
        const self = this;
        
        this.sketch = new p5((p) => {
            p.setup = () => {
                const canvas = p.createCanvas(800, 600);
                canvas.parent('canvas-container');
                p.background(255);
            };

            p.mousePressed = () => {
                if (p.mouseX >= 0 && p.mouseX <= p.width && 
                    p.mouseY >= 0 && p.mouseY <= p.height) {
                    self.isDrawing = true;
                    self.previousMouseX = p.mouseX;
                    self.previousMouseY = p.mouseY;
                }
            };

            p.mouseDragged = () => {
                if (self.isDrawing && 
                    p.mouseX >= 0 && p.mouseX <= p.width && 
                    p.mouseY >= 0 && p.mouseY <= p.height) {
                    
                    const drawingUpdate = {
                        start: { x: self.previousMouseX, y: self.previousMouseY },
                        end: { x: p.mouseX, y: p.mouseY },
                        color: self.state.currentTool === 'eraser' ? '#FFFFFF' : self.state.currentColor,
                        strokeWeight: self.state.strokeWeight,
                        tool: self.state.currentTool
                    };

                    // Send to server
                    if (self.stompClient && self.stompClient.connected) {
                        self.stompClient.send('/app/draw', {}, JSON.stringify(drawingUpdate));
                    }

                    self.previousMouseX = p.mouseX;
                    self.previousMouseY = p.mouseY;
                }
            };

            p.mouseReleased = () => {
                self.isDrawing = false;
            };
        });
    }

    drawLine = (drawingUpdate) => {
        if (this.sketch) {
            this.sketch.push();
            this.sketch.stroke(drawingUpdate.color);
            this.sketch.strokeWeight(drawingUpdate.strokeWeight);
            this.sketch.line(
                drawingUpdate.start.x, 
                drawingUpdate.start.y,
                drawingUpdate.end.x, 
                drawingUpdate.end.y
            );
            this.sketch.pop();
        }
    }

    handleColorChange = (event) => {
        this.setState({ currentColor: event.target.value });
    }

    handleStrokeWeightChange = (event) => {
        this.setState({ strokeWeight: parseInt(event.target.value) });
    }

    handleToolChange = (tool) => {
        this.setState({ currentTool: tool });
    }

    handleClearCanvas = () => {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.send('/app/clear', {}, JSON.stringify({ action: 'clear' }));
        }
    }

    render() {
        const { currentColor, strokeWeight, currentTool, connected, statusMessage } = this.state;

        return (
            <div className="app-container">
                <h1>🎨 Interactive Collaborative Blackboard</h1>
                
                <div className="toolbar">
                    <div className="tool-group">
                        <label>Tool:</label>
                        <button 
                            className={`tool-btn ${currentTool === 'pencil' ? 'active' : ''}`}
                            onClick={() => this.handleToolChange('pencil')}
                        >
                            ✏️ Pencil
                        </button>
                        <button 
                            className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
                            onClick={() => this.handleToolChange('eraser')}
                        >
                            🧹 Eraser
                        </button>
                    </div>

                    <div className="tool-group">
                        <label>Color:</label>
                        <input 
                            type="color" 
                            value={currentColor}
                            onChange={this.handleColorChange}
                            disabled={currentTool === 'eraser'}
                            className="color-picker"
                        />
                    </div>

                    <div className="tool-group">
                        <label>Size: {strokeWeight}px</label>
                        <input 
                            type="range"
                            min="1"
                            max="20"
                            value={strokeWeight}
                            onChange={this.handleStrokeWeightChange}
                            className="size-slider"
                        />
                    </div>

                    <div className="tool-group">
                        <button 
                            className="clear-btn"
                            onClick={this.handleClearCanvas}
                            disabled={!connected}
                        >
                            🗑️ Clear Canvas
                        </button>
                    </div>
                </div>

                <div className="canvas-container" id="canvas-container"></div>

                <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
                    <strong>Status:</strong> {statusMessage}
                </div>

                <div className="info">
                    <strong>ℹ️ Instructions:</strong> 
                    Click and drag on the canvas to draw. 
                    Your drawings will be shared with all connected users in real-time!
                    Use the eraser to remove parts of your drawing.
                    Click "Clear Canvas" to reset the entire board for everyone.
                </div>
            </div>
        );
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<InteractiveBlackboard />);
