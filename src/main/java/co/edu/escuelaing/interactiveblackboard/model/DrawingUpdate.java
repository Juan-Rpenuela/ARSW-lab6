package co.edu.escuelaing.interactiveblackboard.model;

public class DrawingUpdate {
    private Point start;
    private Point end;
    private String color;
    private int strokeWeight;
    private String tool; // "pencil" or "eraser"

    public DrawingUpdate() {
    }

    public DrawingUpdate(Point start, Point end, String color, int strokeWeight, String tool) {
        this.start = start;
        this.end = end;
        this.color = color;
        this.strokeWeight = strokeWeight;
        this.tool = tool;
    }

    public Point getStart() {
        return start;
    }

    public void setStart(Point start) {
        this.start = start;
    }

    public Point getEnd() {
        return end;
    }

    public void setEnd(Point end) {
        this.end = end;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public int getStrokeWeight() {
        return strokeWeight;
    }

    public void setStrokeWeight(int strokeWeight) {
        this.strokeWeight = strokeWeight;
    }

    public String getTool() {
        return tool;
    }

    public void setTool(String tool) {
        this.tool = tool;
    }

    @Override
    public String toString() {
        return "DrawingUpdate{" +
                "start=" + start +
                ", end=" + end +
                ", color='" + color + '\'' +
                ", strokeWeight=" + strokeWeight +
                ", tool='" + tool + '\'' +
                '}';
    }
}
