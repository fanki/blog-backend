package com.example.control;

import dev.langchain4j.service.UserMessage;
import io.quarkiverse.langchain4j.RegisterAiService;

@RegisterAiService
public interface TagSuggestionService {

    @UserMessage("""
                Extrahiere maximal 5 relevante Tags für folgenden Blog-Post.
                Gib die Antwort als JSON-Array zurück.

                Blog-Post:
                {text}
            """)
    String suggestTags(String text);
}
