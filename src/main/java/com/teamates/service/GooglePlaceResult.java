package com.teamates.service;

public record GooglePlaceResult(
        String googlePlaceId,
        String name,
        String address,
        double latitude,
        double longitude
) {}