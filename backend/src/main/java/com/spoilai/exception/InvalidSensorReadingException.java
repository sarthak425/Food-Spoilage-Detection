package com.spoilai.exception;

public class InvalidSensorReadingException extends RuntimeException {
    public InvalidSensorReadingException(String message) {
        super(message);
    }
}
