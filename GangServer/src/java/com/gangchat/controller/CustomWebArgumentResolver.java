/*
 *  PragmaCMS
 *  Copyright 2012 PragmaCraft LLC.
 *
 *  All rights reserved.
 */
package com.gangchat.controller;

import com.gangchat.service.chat.domain.AppUser;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebArgumentResolver;
import org.springframework.web.context.request.NativeWebRequest;

/**
 * Resolves custom web arguments
 *
 * @author Fatih Mehmet Güler
 */
public class CustomWebArgumentResolver implements WebArgumentResolver {
    public Object resolveArgument(MethodParameter methodParameter, NativeWebRequest webRequest) throws Exception {
        Object result = UNRESOLVED;

        //for supported type: AppUser
        if (methodParameter.getParameterType().equals(AppUser.class)) {
            //get the AppUser argument from request attribute (put in interceptor)
            if ((result = webRequest.getAttribute("appUser", NativeWebRequest.SCOPE_REQUEST)) == null) {
                throw new Exception("Cannot resolve AppUser argument, no appUser attribute in request");
            }
        }

        return result;
    }
}
