package com.example.control;

import dev.langchain4j.service.UserMessage;
import io.quarkiverse.langchain4j.RegisterAiService;

@RegisterAiService
public interface CategorySuggestionService {

    @UserMessage("""
                Bestimme eine passende Kategorie für folgenden Blog-Post.
                Die Antwort soll eine einzelne Kategorie als String sein (z.B. 'Technologie', 'Reisen', 'Gesundheit').

                Blog-Post:
                {text}
            """)
    String suggestCategory(String text);
}
