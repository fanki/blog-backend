package com.example.entity;

import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;

@Entity
public class BlogEntry extends PanacheEntity {
    public String title;
    public String content;
    public boolean approved;

    @Column(columnDefinition = "LONGTEXT")
    public String summary;

    @ElementCollection
    @CollectionTable(name = "blog_entry_tags", joinColumns = @JoinColumn(name = "blog_entry_id"))
    @Column(name = "tag")
    public List<String> tags;

}
