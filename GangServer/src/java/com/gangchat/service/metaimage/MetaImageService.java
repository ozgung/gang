/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.service.metaimage;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author Fatih
 */
public class MetaImageService {
    private String homeFolder;
    MetaImageGenerator generator;

    //create the generator
    public void init() {
        try {
            generator = new MetaImageGenerator(homeFolder + "/test2.html");
        } catch (IOException ex) {
            Logger.getLogger(MetaImageService.class.getName()).log(Level.SEVERE, "Could not create meta image generator: " + ex, ex);
        }
    }

    //--------------------------------------------------------------------------
    //META IMAGE
    //--------------------------------------------------------------------------

    /**
     * Generate meta image for team
     *
     * @param teamName
     * @param teamDescription
     * @return
     */
    public byte[] generateMetaImage(String teamName, String teamDescription) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {

            generator.generateImage(new String[]{teamName, teamDescription}, baos);
        } catch (Exception ex) {
            Logger.getLogger(MetaImageService.class.getName()).log(Level.SEVERE, "Error while generating meta image: " + ex, ex);
        }

        return baos.toByteArray();
    }

    //--------------------------------------------------------------------------
    //SETTERS
    //--------------------------------------------------------------------------

    public void setHomeFolder(String homeFolder) {
        this.homeFolder = homeFolder;
    }
}
