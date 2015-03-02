/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.service.chat.domain;

import com.fmguler.ven.util.VenList;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.codehaus.jackson.annotate.JsonIgnore;

/**
 * The global app user
 *
 * @author Fatih Mehmet Güler
 */
public class AppUser {
    private Integer id;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private String profileImage;

    private List<TeamUser> teams = new VenList(TeamUser.class, "user"); //teams of this user

    public AppUser() {
    }

    //used for json serialization with just id
    public AppUser(Integer id) {
        this.id = id;
        teams = null;
    }

    /**
     * @return the id
     */
    public Integer getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * @return the username
     */
    public String getUsername() {
        return username;
    }

    /**
     * @param username the username to set
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * @return the password
     */
    @JsonIgnore
    public String getPassword() {
        return password;
    }

    /**
     * @param password the password to set
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * @return the firstName
     */
    public String getFirstName() {
        return firstName;
    }

    /**
     * @param firstName the firstName to set
     */
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    /**
     * @return the lastName
     */
    public String getLastName() {
        return lastName;
    }

    /**
     * @param lastName the lastName to set
     */
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    /**
     * @return the email
     */
    public String getEmail() {
        return email;
    }

    /**
     * @param email the email to set
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * @return the teams
     */
    public List<TeamUser> getTeams() {
        return teams;
    }

    /**
     * @param teams the teams to set
     */
    public void setTeams(List<TeamUser> teams) {
        this.teams = teams;
    }

    /*
     * ************************************************************
     * AUTHENTICATION RELATED METHODS
     * ************************************************************
     */

    /**
     * Check if the hashed password is equal to the passwordToCheck
     */
    public boolean checkPassword(String passwordToCheck) {
        try {
            byte[] hashedPw = MessageDigest.getInstance("MD5").digest(passwordToCheck.getBytes());
            passwordToCheck = toHex(hashedPw);
            return passwordToCheck.equals(password);
        } catch (NoSuchAlgorithmException ex) {
            Logger.getLogger(AppUser.class.getName()).log(Level.SEVERE, "Cannot hash user password", ex);
            return false;
        }
    }

    /**
     * @param passwordToReset set the new plain password
     */
    public void resetPassword(String passwordToReset) {
        try {
            byte[] hashedPw = MessageDigest.getInstance("MD5").digest(passwordToReset.getBytes());
            password = toHex(hashedPw);
        } catch (NoSuchAlgorithmException ex) {
            Logger.getLogger(AppUser.class.getName()).log(Level.SEVERE, "Cannot hash user password", ex);
        }
    }

    //byte array to hex
    protected static String toHex(byte[] bytes) {
        char[] hexChar = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};
        String result = "";
        for (int i = 0; i < bytes.length; i++) {
            result += hexChar[(bytes[i] & 0xf0) >> 4];
            result += hexChar[bytes[i] & 0x0f];
        }
        return result;
    }

    /**
     * Check if this user belongs to this team
     */
    public boolean checkTeam(Integer teamId) {

        for (TeamUser teamUser : teams) {
            if (teamUser.getTeam().getId().equals(teamId)) return true;
        }

        return false;
    }

    /**
     * @return the profileImage
     */
    public String getProfileImage() {
        return profileImage;
    }

    /**
     * @param profileImage the profileImage to set
     */
    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

}
