package com.example.boundry;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import com.example.entity.BlogEntry;
import com.example.messaging.ValidationRequest;
import com.example.messaging.ValidationResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.control.SummaryService;
import com.example.control.TagSuggestionService;

import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import io.smallrye.common.annotation.Blocking;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/blogs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BlogResource {

    private static final Logger LOGGER = Logger.getLogger(BlogResource.class);

    @Inject
    @Channel("validation-request")
    Emitter<ValidationRequest> validationRequestEmitter;

    @Inject
    SummaryService summaryService;

    @Inject
    TagSuggestionService tagSuggestionService;

    @Inject
    ObjectMapper mapper;

    @POST
    public Response createBlog(BlogEntry entry) {
        persistBlogEntry(entry);
        validationRequestEmitter.send(new ValidationRequest(entry.id, entry.title + " " + entry.content));
        return Response.ok(entry).build();
    }

    @Transactional
    void persistBlogEntry(BlogEntry entry) {
        entry.approved = false;

        try {
            entry.summary = summaryService.summarize(entry.title + " " + entry.content);
        } catch (Exception e) {
            LOGGER.warn("Fehler bei der Zusammenfassung", e);
            entry.summary = "Zusammenfassung konnte nicht erstellt werden.";
        }

        try {
            String tagsJson = tagSuggestionService.suggestTags(entry.title + " " + entry.content);
            entry.tags = mapper.readValue(tagsJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            LOGGER.error("Fehler bei der Tag-Generierung", e);
        }

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
        LOGGER.info("Blogs gefunden: " + blogs.size());
        return blogs;
    }

    @POST
    @Path("/suggest-tags")
    public Response suggestTags(TagSuggestionRequest request) {
        try {
            String blogText = request.title() + " " + request.content();
            String tagsJson = tagSuggestionService.suggestTags(blogText);
            List<String> tags = mapper.readValue(tagsJson, new TypeReference<List<String>>() {});
            return Response.ok(tags).build();
        } catch (Exception e) {
            LOGGER.error("Fehler bei der Tag-Generierung", e);
            return Response.serverError().entity("Fehler bei der Tag-Generierung").build();
        }
    }

    public record TagSuggestionRequest(String title, String content) {}
}
