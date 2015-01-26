/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.service.chat;

import com.fmguler.ven.Criteria;
import com.fmguler.ven.Ven;
import com.gangchat.service.chat.domain.Channel;
import com.gangchat.service.chat.domain.AppUser;
import com.gangchat.service.chat.domain.Team;
import com.gangchat.service.chat.domain.TeamUser;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.sql.DataSource;

/**
 * Chat Service, handles user, channel and message operations
 *
 * @author Fatih Mehmet Güler
 */
public class ChatService {
    private Ven ven;

    public void init() {

    }

    //--------------------------------------------------------------------------
    //USER
    //--------------------------------------------------------------------------
    

    /**
     * Get the user by username
     */
    public AppUser getUser(String username) {
        Set joins = new HashSet();
        joins.add("AppUser.teams.team");
        Criteria criteria = new Criteria();
        criteria.eq("AppUser.username", username);
        List<AppUser> list = ven.list(AppUser.class, joins, criteria);
        if (list.isEmpty()) return null;
        return list.get(0);
    }

    /**
     * Get the user by id (with team and channels)
     */
    public AppUser getUser(int userId) {
        Set joins = new HashSet();
        joins.add("AppUser.teams.team.channels");
        Criteria criteria = new Criteria();
        return (AppUser)ven.get(userId, AppUser.class, joins);
    }
    

    /**
     * Save the user
     */
    public void saveUser(AppUser user) {
        ven.save(user);
    }

    /**
     * Remove the user
     */
    public void removeUser(int id) {
        ven.delete(id, AppUser.class);
    }

    //--------------------------------------------------------------------------
    //TEAM
    //--------------------------------------------------------------------------

    public List<Team> getTeams(int userId){
        Set joins = new HashSet();
        joins.add("Team.channels");
        joins.add("Team.users.user");
        Criteria criteria = new Criteria();
        criteria.orderAsc("Team.channels.id");
        criteria.eq("Team.users.user.id", userId);

        return ven.list(Team.class, joins, criteria);
    }

    /**
     * Save the team
     */
    public void saveTeam(Team account) {
        ven.save(account);
    }
    
    /**
     * Save the team user
     */
    public void saveTeamUser(TeamUser teamUser) {
        ven.save(teamUser);
    }

    /**
     * Remove the team
     */
    public void removeTeam(int id) {
        ven.delete(id, Team.class);
    }
    
    //--------------------------------------------------------------------------
    //CHANNEL
    //--------------------------------------------------------------------------

    /**
     * Get the channel by id (with users)
     */
    public Channel getChannel(int channelId) {
        Set joins = new HashSet();
        joins.add("Channel.team.users");
        Criteria criteria = new Criteria();
        return (Channel)ven.get(channelId, Channel.class, joins);
    }
    
    /**
     * Save the channel
     */
    public void saveChannel(Channel user) {
        ven.save(user);
    }

    /**
     * Remove the channel
     */
    public void removeChannel(int id) {
        ven.delete(id, Channel.class);
    }

    //--------------------------------------------------------------------------
    //SETTERS
    //--------------------------------------------------------------------------
    public void setDataSource(DataSource dataSource) {
        ven = new Ven();
        ven.setDataSource(dataSource);
        ven.addDomainPackage("com.gangchat.service.chat.domain");
    }
}
