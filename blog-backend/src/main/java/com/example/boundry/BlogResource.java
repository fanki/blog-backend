package com.example.boundry;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import com.example.entity.BlogEntry;
import com.example.messaging.ValidationRequest;
import com.example.messaging.ValidationResponse;
import com.example.control.SummaryService;

import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import io.smallrye.common.annotation.Blocking;

import java.util.List;

@Path("/blogs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BlogResource {

    @Inject
    @Channel("validation-request")
    Emitter<ValidationRequest> validationRequestEmitter;

    @Inject
    SummaryService summaryService; // KI-Service für automatische Zusammenfassungen

    @POST
    public Response createBlog(BlogEntry entry) {
        persistBlogEntry(entry); // Speichert den Blog-Post in der DB (transaktional)

        // Kafka-Emit außerhalb der Transaktion
        validationRequestEmitter.send(new ValidationRequest(entry.id, entry.title + " " + entry.content));

        return Response.ok(entry).build();
    }

    @Transactional
    void persistBlogEntry(BlogEntry entry) {
        entry.approved = false;

        // KI-generierte Zusammenfassung mit Fehlerbehandlung
        String summary;
        try {
            summary = summaryService.summarize(entry.title + " " + entry.content);
        } catch (Exception e) {
            summary = "Zusammenfassung konnte nicht erstellt werden.";
            e.printStackTrace(); // TODO: Logger verwenden
        }

        entry.summary = summary;
        entry.persist();
    }

    @Incoming("validation-response")
    @Blocking
    @Transactional
    public void processValidationResponse(ValidationResponse validationResponse) {
        BlogEntry entry = BlogEntry.findById(validationResponse.id());
        if (entry != null) {
            entry.approved = validationResponse.valid();
            entry.persist();
        }
    }

    @GET
    public List<BlogEntry> listAll() {
        List<BlogEntry> blogs = BlogEntry.listAll();
        System.out.println("Blogs gefunden: " + blogs.size());
        return blogs;
    }
}
