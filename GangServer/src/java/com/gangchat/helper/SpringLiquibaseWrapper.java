/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.helper;

import java.util.Locale;
import liquibase.exception.LiquibaseException;
import liquibase.integration.spring.SpringLiquibase;

/**
 * Wrapper for liquibase.spring.SpringLiquibase (which cannot handle Turkish locale)
 *
 * @author Fatih Mehmet Güler
 */
public class SpringLiquibaseWrapper extends SpringLiquibase {
    private boolean liquibaseEnabled = true;

    //set locale to English while updating with liquibase, since it does not handle Turkish locale
    @Override
    public void afterPropertiesSet() throws LiquibaseException {
        if (!liquibaseEnabled) return;
        Locale currLocale = Locale.getDefault();
        Locale.setDefault(Locale.ENGLISH);
        super.afterPropertiesSet();
        Locale.setDefault(currLocale);
    }

    //disable liquibase if liquibaseEnabled is set to false
    public void setLiquibaseEnabled(String liquibaseEnabled) {
        if (liquibaseEnabled == null || liquibaseEnabled.trim().equals("")) return;
        if (liquibaseEnabled.trim().toLowerCase(Locale.ENGLISH).equals("false")) {
            this.liquibaseEnabled = false;
        }
    }
}
