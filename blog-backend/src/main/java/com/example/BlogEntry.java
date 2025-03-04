package com.example;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

@Entity
public class BlogEntry extends PanacheEntity {
    public String title;
    public String content;
    public boolean approved;
}
