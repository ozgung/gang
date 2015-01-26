/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.service.chat.domain;

/**
 * Each User in a Team
 *
 * @author Fatih Mehmet Güler
 */
public class TeamUser {
    private Integer id;
    private Team team;
    private AppUser user;

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
     * @return the team
     */
    public Team getTeam() {
        return team;
    }

    /**
     * @param team the team to set
     */
    public void setTeam(Team team) {
        this.team = team;
    }

    /**
     * @return the user
     */
    public AppUser getUser() {
        return user;
    }

    /**
     * @param user the user to set
     */
    public void setUser(AppUser user) {
        this.user = user;
    }

}
