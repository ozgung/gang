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
    private String name; //the team name
    private String description; //the team name
    private String domains; //white space separated domain names of this team
    private String company;
    private String address;
    private String city;
    private String state;
    private String country;
    private String phone;
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
     * @return the company
     */
    public String getCompany() {
        return company;
    }

    /**
     * @param company the company to set
     */
    public void setCompany(String company) {
        this.company = company;
    }

    /**
     * @return the address
     */
    public String getAddress() {
        return address;
    }

    /**
     * @param address the address to set
     */
    public void setAddress(String address) {
        this.address = address;
    }

    /**
     * @return the city
     */
    public String getCity() {
        return city;
    }

    /**
     * @param city the city to set
     */
    public void setCity(String city) {
        this.city = city;
    }

    /**
     * @return the state
     */
    public String getState() {
        return state;
    }

    /**
     * @param state the state to set
     */
    public void setState(String state) {
        this.state = state;
    }

    /**
     * @return the country
     */
    public String getCountry() {
        return country;
    }

    /**
     * @param country the country to set
     */
    public void setCountry(String country) {
        this.country = country;
    }

    /**
     * @return the phone
     */
    public String getPhone() {
        return phone;
    }

    /**
     * @param phone the phone to set
     */
    public void setPhone(String phone) {
        this.phone = phone;
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
