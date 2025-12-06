package com.example.hr.config;

import com.example.hr.exception.BusinessException;
import com.example.hr.exception.ErrorEnum;
import com.example.hr.vo.ResultVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;

/**
 * 全局异常处理器：统一捕获并处理所有异常，返回标准化响应
 */
@Slf4j
@RestControllerAdvice // 作用于所有@RestController
public class GlobalExceptionHandler {

    /**
     * 处理业务异常（自定义）
     */
    @ExceptionHandler(BusinessException.class)
    public ResultVO<?> handleBusinessException(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return ResultVO.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理参数校验异常（@RequestBody对象校验）
     */
    @ExceptionHandler(BindException.class)
    public ResultVO<?> handleBindException(BindException e) {
        String errorMsg = e.getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("；"));
        log.warn("参数校验异常: {}", errorMsg);
        return ResultVO.error(ErrorEnum.PARAM_ERROR.getCode(), errorMsg);
    }

    /**
     * 处理参数校验异常（@RequestParam/@PathVariable校验）
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResultVO<?> handleConstraintViolationException(ConstraintViolationException e) {
        String errorMsg = e.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining("；"));
        log.warn("参数校验异常: {}", errorMsg);
        return ResultVO.error(ErrorEnum.PARAM_ERROR.getCode(), errorMsg);
    }

    /**
     * 处理404异常
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResultVO<?> handleNoHandlerFoundException(NoHandlerFoundException e) {
        log.warn("资源不存在: {}", e.getRequestURL());
        return ResultVO.error(ErrorEnum.RESOURCE_NOT_FOUND.getCode(), ErrorEnum.RESOURCE_NOT_FOUND.getMsg());
    }

    /**
     * 处理系统异常（兜底）
     */
    @ExceptionHandler(Exception.class)
    public ResultVO<?> handleSystemException(Exception e) {
        log.error("系统异常", e); // 打印完整堆栈便于排查
        return ResultVO.error(ErrorEnum.SYSTEM_ERROR.getCode(), ErrorEnum.SYSTEM_ERROR.getMsg());
    }
}