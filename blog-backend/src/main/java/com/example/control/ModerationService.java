package com.example.control;

import dev.langchain4j.service.UserMessage;
import io.quarkiverse.langchain4j.RegisterAiService;

@RegisterAiService
public interface ModerationService {

    @UserMessage("""
                Prüfe den folgenden Text auf unangemessene Inhalte wie Beleidigungen, Hate Speech oder toxische Sprache.
                Antworte mit "SAFE", wenn der Inhalt unbedenklich ist, oder mit "UNSAFE", wenn der Inhalt problematisch ist.

                Blog-Post:
                {text}
            """)
    String moderate(String text);
}