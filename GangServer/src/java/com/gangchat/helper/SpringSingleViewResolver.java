/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.helper;

import org.springframework.web.servlet.view.AbstractUrlBasedView;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

/**
 *
 * @author Fatih
 */
public class SpringSingleViewResolver extends InternalResourceViewResolver{

    @Override
    protected AbstractUrlBasedView buildView(String viewName) throws Exception {
        return super.buildView("view"); 
    }
    
}
