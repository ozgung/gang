/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.controller;

import com.auth0.jwt.JWTSigner;
import com.gangchat.service.chat.ChatService;
import com.gangchat.service.chat.domain.AppUser;
import com.gangchat.service.chat.domain.Channel;
import com.gangchat.service.chat.domain.Team;
import com.gangchat.service.chat.domain.TeamUser;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.ServletRequestUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Chat controller, Rest API
 *
 * @author Fatih Mehmet Güler
 */
@Controller
public class ApiController {
    private ChatService chatService;

    //json enumerations
    public static final String JSON_STATUS_SUCCESS = "0";
    public static final String JSON_STATUS_FAIL = "-1";

    //ajax - signup
    @RequestMapping()
    public Map signup(HttpServletRequest request) {
        Map result = new HashMap();

        //get all the fields
        String firstName = ServletRequestUtils.getStringParameter(request, "firstName", "");
        String lastName = ServletRequestUtils.getStringParameter(request, "lastName", "");
        String username = ServletRequestUtils.getStringParameter(request, "username", "").toLowerCase(Locale.ENGLISH);
        String password = ServletRequestUtils.getStringParameter(request, "password", "");
        String email = ServletRequestUtils.getStringParameter(request, "email", "");

        //collect all the errors
        List<String> errors = new LinkedList();

        //the most important checks first
        if (!username.matches("[A-Za-z0-9-.]{3,100}")) errors.add("Please enter a valid username, no special chars.");
        else if (chatService.getUser(username) != null) errors.add("This username is taken, please choose another one.");
        if (password.trim().isEmpty()) errors.add("Please enter a password.");

        //return all of the error(s)
        if (!errors.isEmpty()) {
            result.put("status", JSON_STATUS_FAIL);
            result.put("message", "Signup failed");
            result.put("errors", errors);
            return result;
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.resetPassword(password);
        user.setEmail(email);

        chatService.saveUser(user);

        //return the success status
        result.put("status", JSON_STATUS_SUCCESS);
        result.put("message", "OK");
        return result;
    }

    //ajax - login
    @RequestMapping
    public Map login(@RequestParam String username, @RequestParam String password, HttpServletRequest request) {
        Map result = new HashMap();

        //get the user
        AppUser user = chatService.getUser(username);

        //check if user exists and is authenticated
        if (user == null || !user.checkPassword(password)) {
            result.put("status", JSON_STATUS_FAIL);
            result.put("message", "Username or password incorrect");
            result.put("token", "");
            return result;
        }

        //JWT SIGN
        JWTSigner signer = new JWTSigner("my secret");
        HashMap<String, Object> claims = new HashMap<String, Object>();
        claims.put("userId", user.getId());
        claims.put("username", user.getUsername());
        claims.put("email", user.getEmail());
        claims.put("createdAt", new Date());
        String token = signer.sign(claims);


        //return the signed token
        result.put("status", JSON_STATUS_SUCCESS);
        result.put("message", "OK");
        result.put("token", token);

        return result;
    }

    //ajax - me
    @RequestMapping
    public AppUser me(AppUser user) {
        //to get the whole object graph
        return chatService.getUser(user.getId());
    }

    //ajax - subscribe to team
    @RequestMapping
    public Map subscribe(@RequestParam Integer teamId, AppUser user) {
        Map result = new HashMap();

        //collect all the errors
        List<String> errors = new LinkedList();

        //TODO check if this user can subscribe to this team according to some stuff (facebook groups, invitations, etc)
        if (false) errors.add("You cannot subscribe to this team");

        //return all of the error(s)
        if (!errors.isEmpty()) {
            result.put("status", JSON_STATUS_FAIL);
            result.put("message", "Create channel failed");
            result.put("errors", errors);
            return result;
        }

        Team team = new Team();
        team.setId(teamId);

        //create user team
        TeamUser teamUser = new TeamUser();
        teamUser.setTeam(team);
        teamUser.setUser(user);
        chatService.saveTeamUser(teamUser);

        //return the success status
        result.put("status", JSON_STATUS_SUCCESS);
        result.put("message", "OK");
        return result;
    }


    //ajax - create team
    @RequestMapping()
    public Map createTeam(AppUser user, HttpServletRequest request) {
        Map result = new HashMap();

        //get all the fields
        String name = ServletRequestUtils.getStringParameter(request, "name", "");
        String description = ServletRequestUtils.getStringParameter(request, "description", "");

        //collect all the errors
        List<String> errors = new LinkedList();

        //the most important checks first
        if (name.trim().isEmpty()) errors.add("Please enter a team name.");

        //return all of the error(s)
        if (!errors.isEmpty()) {
            result.put("status", JSON_STATUS_FAIL);
            result.put("message", "Create team failed");
            result.put("errors", errors);
            return result;
        }

        //create the team
        Team team = new Team();
        team.setName(name);
        team.setDescription(description);
        chatService.saveTeam(team);

        //add the user as the team user
        TeamUser teamUser = new TeamUser();
        teamUser.setTeam(team);
        teamUser.setUser(user);
        chatService.saveTeamUser(teamUser);

        //add a channel
        Channel channel = new Channel();
        channel.setName("General");
        channel.setDescription("Default channel");
        channel.setTeam(team);
        chatService.saveChannel(channel);

        //return the success status
        result.put("status", JSON_STATUS_SUCCESS);
        result.put("message", "OK");
        return result;
    }

    //ajax - create channel
    @RequestMapping()
    public Map createChannel(@RequestParam Integer teamId, AppUser user, HttpServletRequest request) {
        Map result = new HashMap();

        //get all the fields
        String name = ServletRequestUtils.getStringParameter(request, "name", "");
        String description = ServletRequestUtils.getStringParameter(request, "description", "");

        //collect all the errors
        List<String> errors = new LinkedList();

        //the most important checks first
        if (name.trim().isEmpty()) errors.add("Please enter a channel name.");

        //check if this user is in this team
        AppUser appUser = chatService.getUser(user.getId());
        if (!appUser.checkTeam(teamId)) errors.add("You cannot add channel to this team");

        //return all of the error(s)
        if (!errors.isEmpty()) {
            result.put("status", JSON_STATUS_FAIL);
            result.put("message", "Create channel failed");
            result.put("errors", errors);
            return result;
        }

        Team team = new Team();
        team.setId(teamId);

        //create a channel
        Channel channel = new Channel();
        channel.setName(name);
        channel.setDescription(description);
        channel.setTeam(team);
        chatService.saveChannel(channel);

        //return the success status
        result.put("status", JSON_STATUS_SUCCESS);
        result.put("message", "OK");
        return result;
    }


    //--------------------------------------------------------------------------
    //SETTERS
    //--------------------------------------------------------------------------

    @Autowired
    public void setChatService(ChatService chatService) {
        this.chatService = chatService;
    }
}
