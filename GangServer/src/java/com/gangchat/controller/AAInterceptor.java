/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.controller;

import com.auth0.jwt.JWTVerifier;
import com.gangchat.service.chat.domain.AppUser;
import java.security.SignatureException;
import java.util.Date;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

/**
 *
 * @author Fatih
 */
public class AAInterceptor extends HandlerInterceptorAdapter {
    private static final long TOKEN_EXPIRE_INTERVAL = 7 * 24 * 60 * 60 * 1000; //a week

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        //get the path
        String path = extractPath(request);

        //if public page (i.e. login/signup) return
        if (isPublicPage(path)) return true;

        //get the auth token
        String token = request.getHeader("Authorization");
        if (token == null) token = request.getParameter("token");

        //no auth token
        if (token == null) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            System.err.println("Token not found in headers or parameters");
            return false;
        }

        try {
            //verify the token
            Map<String, Object> claims = new JWTVerifier("my secret", "audience").verify(token);

            //check expiration
            long createdAt = (long)claims.get("createdAt");
            if (new Date(createdAt).before(new Date(new Date().getTime() - TOKEN_EXPIRE_INTERVAL))) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN);
                System.err.println("Token expired");
                return false;
            }

            //set the user as request attribute so that all controllers know which user is this current request belong to
            AppUser appUser = new AppUser();
            appUser.setId((Integer)claims.get("userId"));
            appUser.setUsername((String)claims.get("username"));
            appUser.setEmail((String)claims.get("email"));

            request.setAttribute("appUser", appUser);

            return true;
        } catch (SignatureException signatureException) {
            System.err.println("Invalid signature!");
        } catch (IllegalStateException illegalStateException) {
            System.err.println("Invalid Token! " + illegalStateException);
        }

        response.sendError(HttpServletResponse.SC_FORBIDDEN);
        return false;
    }

    //check if this path is a public or protected page
    private boolean isPublicPage(String path) {
        //login pages
        if (path.equals("/api/login")) return true;
        if (path.equals("/api/signup")) return true;

        return false;
    }

    //get the path from request
    private String extractPath(HttpServletRequest request) {
        String path = "";
        String contextPath = request.getContextPath();
        String requestUri = request.getRequestURI();
        if (requestUri.startsWith(contextPath)) path = requestUri.substring(contextPath.length());
        else path = requestUri;
        return path;
    }

}
