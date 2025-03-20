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
import com.example.control.CategorySuggestionService;
import com.example.control.ModerationService;

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
    CategorySuggestionService categorySuggestionService;

    @Inject
    ObjectMapper mapper;

    @Inject
    ModerationService moderationService;

    @POST
    public Response createBlog(BlogEntry entry) {
        persistBlogEntry(entry);

        validationRequestEmitter.send(new ValidationRequest(entry.id, entry.title + " " + entry.content));

        if (entry.summary != null && entry.summary.length() > 10000) {
            LOGGER.warn("Summary ist zu lang!");
        }

        return Response.ok(entry).build();
    }

    @Transactional
    void persistBlogEntry(BlogEntry entry) {
        entry.approved = false; // Standard: blockiert

        // 1. Zusammenfassung erzeugen
        try {
            entry.summary = summaryService.summarize(entry.title + " " + entry.content);
        } catch (Exception e) {
            LOGGER.warn("Fehler bei Zusammenfassung", e);
        }

        // 2. Tags & Kategorien vorschlagen
        try {
            String tagsJson = tagSuggestionService.suggestTags(entry.title + " " + entry.content);
            entry.tags = mapper.readValue(tagsJson, new TypeReference<List<String>>() {
            });
        } catch (Exception e) {
            LOGGER.error("Fehler bei Tag-Generierung", e);
        }

        try {
            String category = categorySuggestionService.suggestCategory(entry.title + " " + entry.content);
            entry.category = category;
        } catch (Exception e) {
            LOGGER.error("Fehler bei Kategorie-Zuordnung", e);
        }

        // 3. Moderation prüfen
        try {
            String moderationResult = moderationService.moderate(entry.title + " " + entry.content);
            LOGGER.infof("Moderationsergebnis: %s", moderationResult);
            if ("SAFE".equalsIgnoreCase(moderationResult.trim())) {
                entry.approved = true;
            } else {
                LOGGER.warn("Blog-Post enthält problematische Inhalte. Muss manuell geprüft werden.");
            }
        } catch (Exception e) {
            LOGGER.error("Fehler bei der Moderation", e);
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
            List<String> tags = mapper.readValue(tagsJson, new TypeReference<List<String>>() {
            });
            return Response.ok(tags).build();
        } catch (Exception e) {
            LOGGER.error("Fehler bei der Tag-Generierung", e);
            return Response.serverError().entity("Fehler bei der Tag-Generierung").build();
        }
    }

    @POST
    @Path("/suggest-tags-categories")
    public Response suggestTagsAndCategory(TagSuggestionRequest request) {
        try {
            String blogText = request.title() + " " + request.content();

            String tagsJson = tagSuggestionService.suggestTags(blogText);
            List<String> tags = mapper.readValue(tagsJson, new TypeReference<List<String>>() {
            });

            String category = categorySuggestionService.suggestCategory(blogText);

            return Response.ok(new TagCategorySuggestionResponse(tags, category)).build();
        } catch (Exception e) {
            LOGGER.error("Fehler bei der Vorschlags-Generierung", e);
            return Response.serverError().entity("Fehler bei der Vorschlags-Generierung").build();
        }
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response updateBlog(@PathParam("id") Long id, BlogEntry updatedEntry) {
        BlogEntry existingEntry = BlogEntry.findById(id);
        if (existingEntry == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        existingEntry.title = updatedEntry.title;
        existingEntry.content = updatedEntry.content;
        existingEntry.category = updatedEntry.category;
        existingEntry.tags = updatedEntry.tags;
        existingEntry.summary = updatedEntry.summary;

        existingEntry.persist();
        return Response.ok(existingEntry).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteBlog(@PathParam("id") Long id) {
        BlogEntry entry = BlogEntry.findById(id);
        if (entry == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        entry.delete();
        return Response.noContent().build();
    }

    @PUT
    @Path("/approve/{id}")
    @Transactional
    public Response approveBlog(@PathParam("id") Long id) {
        BlogEntry entry = BlogEntry.findById(id);
        if (entry == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        entry.approved = true;
        entry.persist();
        return Response.ok(entry).build();
    }

    @GET
    @Path("/pending")
    public List<BlogEntry> listPending() {
        return BlogEntry.list("approved", false);
    }

    @POST
    @Path("/moderate")
    public Response moderateContent(TagSuggestionRequest request) {
        try {
            String blogText = request.title() + " " + request.content();
            String moderationResult = moderationService.moderate(blogText);

            LOGGER.info("Moderationsergebnis: " + moderationResult);

            boolean safe = "SAFE".equalsIgnoreCase(moderationResult.trim());

            return Response.ok(new ModerationResponse(safe)).build();
        } catch (Exception e) {
            LOGGER.error("Fehler bei der Moderation", e);
            return Response.serverError().entity("Fehler bei der Moderation").build();
        }
    }

    // DTO
    public record ModerationResponse(boolean safe) {
    }

    // DTOs für Requests & Responses
    public record TagSuggestionRequest(String title, String content) {
    }

    public record TagCategorySuggestionResponse(List<String> tags, String category) {
    }
}
