package com.example;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.example.ValidationResponse;
import com.example.ValidationRequest;
import com.example.BlogEntry;

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

    @POST
    public Response createBlog(BlogEntry entry) {
        persistBlogEntry(entry); // DB-Transaktion separat ausführen
        validationRequestEmitter.send(new ValidationRequest(entry.id, entry.title + " " + entry.content)); // Kafka-Emit außerhalb der Transaktion
        return Response.ok(entry).build();
    }

    @Transactional
    void persistBlogEntry(BlogEntry entry) {
        entry.approved = false;
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
