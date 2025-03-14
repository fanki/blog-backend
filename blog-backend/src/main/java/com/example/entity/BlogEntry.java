package com.example.entity;

import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;

@Entity
public class BlogEntry extends PanacheEntity {
    public String title;
    public String content;
    public boolean approved;
    public String summary;

    @ElementCollection
    public List<String> tags;
}
