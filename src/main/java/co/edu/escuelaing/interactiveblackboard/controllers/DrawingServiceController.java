package co.edu.escuelaing.interactiveblackboard.controllers;

import co.edu.escuelaing.interactiveblackboard.model.DrawingUpdate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@Controller
public class DrawingServiceController {
    
    @MessageMapping("/draw")
    @SendTo("/topic/drawings")
    public DrawingUpdate handleDrawing(DrawingUpdate drawingUpdate) {
        System.out.println("Received drawing update: " + drawingUpdate);
        return drawingUpdate;
    }

    @MessageMapping("/clear")
    @SendTo("/topic/clear")
    public String handleClear(String message) {
        System.out.println("Clear canvas requested");
        return message;
    }
}

@RestController
class StatusController {
    @RequestMapping(value = "/status", method = RequestMethod.GET, produces = "application/json")
    public String status() {
        return "{\"status\":\"Greetings from Spring Boot. "
                + java.time.LocalDate.now() + ", "
                + java.time.LocalTime.now()
                + ". " + "The server is Running!\"}";
    }
}
