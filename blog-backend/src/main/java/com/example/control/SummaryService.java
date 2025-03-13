package com.example.control;

import dev.langchain4j.service.UserMessage;
import io.quarkiverse.langchain4j.RegisterAiService;

@RegisterAiService
public interface SummaryService {

    @UserMessage("Erstelle eine kurze Zusammenfassung für folgenden Blog: {text}")
    String summarize(String text);
}