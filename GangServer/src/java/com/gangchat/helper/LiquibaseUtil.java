/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.helper;

import com.fmguler.ven.support.LiquibaseConverter;
import java.sql.SQLException;
import java.util.Locale;
import javax.sql.DataSource;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.LiquibaseException;
import liquibase.resource.FileSystemResourceAccessor;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

/**
 * Database utilities for testing (while developing)
 * For Liquibase 2.0
 *
 * @author Fatih Mehmet Güler
 */
public class LiquibaseUtil {
    /**
     * @return DataSource for the test database
     */
    public static DataSource getDataSource(String databaseName) {
        //NOTE this is for development environment, we assume username password is postgres-qwerty
        //and we use DriverManagerDataSource for testing easily.
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("org.postgresql.Driver");
        ds.setUsername("postgres");
        ds.setPassword("qwerty123");
        //ds.setUrl("jdbc:postgresql://127.0.0.1:5432/" + databaseName);
        ds.setUrl("jdbc:postgresql://192.168.1.11:5432/" + databaseName);
        return ds;
    }

    /**
     * @return Liquibase object for the given database
     */
    public static Liquibase getLiquibase(String databaseName) {
        try {
            //NOTE that since this is just for development environment, we don't even close the connection
            Database database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(getDataSource(databaseName).getConnection()));
            Liquibase liquibase = new Liquibase("web/WEB-INF/database-changelog.xml", new FileSystemResourceAccessor(), database);
            return liquibase;
        } catch (SQLException ex) {
            ex.printStackTrace();
        } catch (LiquibaseException ex) {
            ex.printStackTrace();
        }
        return null;
    }

    /**
     * Build the test database
     */
    public static void buildDatabase(String databaseName) {
        try {
            Locale currLocale = Locale.getDefault();
            Locale.setDefault(Locale.ENGLISH);
            Liquibase liquibase = getLiquibase(databaseName);
            liquibase.update("");
            Locale.setDefault(currLocale);
        } catch (LiquibaseException ex) {
            ex.printStackTrace();
        }
    }

    /**
     * Undo changes in the test database either by the given tag name or count
     */
    public static void rollbackDatabase(String databaseName, String tag, int count) {
        try {
            Locale currLocale = Locale.getDefault();
            Locale.setDefault(Locale.ENGLISH);
            Liquibase liquibase = getLiquibase(databaseName);
            if (tag == null) liquibase.rollback(count, "");
            else liquibase.rollback(tag, "");
            Locale.setDefault(currLocale);
        } catch (LiquibaseException ex) {
            ex.printStackTrace();
        }
    }

    /**
     * Generate changelog according to specified domain package
     */
    public static void generateChangeLog(String author, int changeSetIdStart, String domainPackage) {
        LiquibaseConverter liquibaseConverter = new LiquibaseConverter();
        liquibaseConverter.setAuthor("fmguler");
        liquibaseConverter.setChangeSetIdStart(1);
        liquibaseConverter.addDomainPackage(domainPackage);
        String liquibaseXml = liquibaseConverter.convert();
        System.out.println(liquibaseXml);
    }

    /**
     * Quick test liquibase
     */
    public static void main(String[] args) {
        String databaseName = "gangdb";
        String domainPackage = "com.gangchat.service.chat.domain";

        //generateChangeLog("fmguler", 1, domainPackage);
        buildDatabase(databaseName);
        //rollbackDatabase(databaseName, "tag-init", 0);
        //rollbackDatabase(databaseName, null, 1);
    }
}
