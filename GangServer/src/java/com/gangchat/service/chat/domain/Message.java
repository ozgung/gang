/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.service.chat.domain;

import java.util.Date;

/**
 * Message objects
 *
 * @author Fatih Mehmet Güler
 */
public class Message {
    private Integer id;
    private Date date; //the date of the message archive, to order
    private AppUser sender;
    private Channel channel;
    private String message; //messages as json obj

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
     * @return the message
     */
    public String getMessage() {
        return message;
    }

    /**
     * @param message the message to set
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * @return the channel
     */
    public Channel getChannel() {
        return channel;
    }

    /**
     * @param channel the channel to set
     */
    public void setChannel(Channel channel) {
        this.channel = channel;
    }

    /**
     * @return the date
     */
    public Date getDate() {
        return date;
    }

    /**
     * @param date the date to set
     */
    public void setDate(Date date) {
        this.date = date;
    }

    /**
     * @return the sender
     */
    public AppUser getSender() {
        return sender;
    }

    /**
     * @param sender the sender to set
     */
    public void setSender(AppUser sender) {
        this.sender = sender;
    }
}
