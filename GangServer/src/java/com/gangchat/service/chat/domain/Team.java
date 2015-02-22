/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.service.chat.domain;

import com.fmguler.ven.util.VenList;
import java.util.List;

/**
 * Each team have its users and channels
 *
 * @author Fatih Mehmet Güler
 */
public class Team {
    private Integer id;
    private String uniqueId; //some global unique id (e.g. FB id)
    private String name; //the team name
    private String description; //the team name
    private String domains; //white space separated domain names of this team
    private List<TeamUser> users = new VenList(TeamUser.class, "team"); //users of this team
    private List<Channel> channels = new VenList(Channel.class, "team"); //channels of this team

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
     * @return the uniqueId
     */
    public String getUniqueId() {
        return uniqueId;
    }

    /**
     * @param uniqueId the uniqueId to set
     */
    public void setUniqueId(String uniqueId) {
        this.uniqueId = uniqueId;
    }

    /**
     * @return the domains
     */
    public String getDomains() {
        return domains;
    }

    /**
     * @param domains the domains to set
     */
    public void setDomains(String domains) {
        this.domains = domains;
    }

    /**
     * @return the users
     */
    public List<TeamUser> getUsers() {
        return users;
    }

    /**
     * @param users the users to set
     */
    public void setUsers(List<TeamUser> users) {
        this.users = users;
    }

    /**
     * @return the channels
     */
    public List<Channel> getChannels() {
        return channels;
    }

    /**
     * @param channels the channels to set
     */
    public void setChannels(List<Channel> channels) {
        this.channels = channels;
    }

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

}
