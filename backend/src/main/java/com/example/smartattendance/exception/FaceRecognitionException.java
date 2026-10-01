package com.example.smartattendance.exception;

import org.springframework.http.HttpStatus;

public class FaceRecognitionException extends ApiException {
    public FaceRecognitionException(String message, String errorCode) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, errorCode);
    }

    public FaceRecognitionException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, "FACE_NOT_RECOGNIZED");
    }
}
