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
import com.gangchat.service.chat.domain.Message;
import com.gangchat.service.chat.domain.Team;
import com.gangchat.service.chat.domain.TeamUser;
import com.gangchat.service.search.SearchService;
import com.google.gson.Gson;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.social.facebook.api.Facebook;
import org.springframework.social.facebook.api.GroupMembership;
import org.springframework.social.facebook.api.impl.FacebookTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.ServletRequestUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Chat controller, Rest API
 *
 * @author Fatih Mehmet Güler
 */
@Controller
public class ApiController {
    private ChatService chatService;
    private SearchService searchService;

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

    //ajax - login with facebook
    @RequestMapping
    public Map loginFB(@RequestParam String token, HttpServletRequest request) {
        Map result = new HashMap();

        try {
            Facebook facebook = new FacebookTemplate(token);
            String facebookId = facebook.userOperations().getUserProfile().getId();

            //get the user
            AppUser user = chatService.getUser(facebookId);

            //check if user exist
            if (user == null) {

                //create a new user (signup)
                user = new AppUser();
                user.setUsername(facebookId);
                user.setFirstName(facebook.userOperations().getUserProfile().getFirstName());
                String middleName = facebook.userOperations().getUserProfile().getMiddleName();
                if (middleName != null && !middleName.trim().equals("")) user.setFirstName(user.getFirstName() + " " + middleName);
                user.setLastName(facebook.userOperations().getUserProfile().getLastName());
                user.setEmail(facebook.userOperations().getUserProfile().getEmail());
                byte[] profileImgBytes = facebook.userOperations().getUserProfileImage();
                if (profileImgBytes != null) user.setProfileImage(Base64.getEncoder().encodeToString(profileImgBytes));

                chatService.saveUser(user);
            }

            //Check user's FB groups and subscribe to new groups, archive nonexisting groups
            for (GroupMembership fbGroup : facebook.groupOperations().getMemberships()) {

                String fbGroupId = fbGroup.getId();
                String fbGroupName = fbGroup.getName();

                //System.out.println(fbGroupId);
                //System.out.println(fbGroupName);

                //check the team and create if not exists
                Team team = chatService.getTeam(fbGroupId);
                if (team == null) {
                    team = new Team();
                    team.setUniqueId(fbGroupId);
                    team.setName(fbGroupName);
                    //team.setDomains("something.ganghq.com"); //come up with a short domain name for this group
                    chatService.saveTeam(team);

                    //add a default channel
                    Channel channel = new Channel();
                    channel.setName("General");
                    channel.setDescription("Default channel");
                    channel.setTeam(team);
                    chatService.saveChannel(channel);
                }

                //check the user exists in the team subscribe if not exists
                if (!chatService.checkTeamContainsUser(fbGroupId, user.getId())) {
                    //add the user as the team user
                    TeamUser teamUser = new TeamUser();
                    teamUser.setTeam(team);
                    teamUser.setUser(user);
                    chatService.saveTeamUser(teamUser);
                }


                //TODO: detect and unsubscribe from the groups user has left 
            }

            //JWT SIGN
            JWTSigner signer = new JWTSigner("my secret");
            HashMap<String, Object> claims = new HashMap<String, Object>();
            claims.put("userId", user.getId());
            claims.put("username", user.getUsername());
            claims.put("email", user.getEmail());
            claims.put("createdAt", new Date());
            String ourToken = signer.sign(claims);

            //return the signed token
            result.put("status", JSON_STATUS_SUCCESS);
            result.put("message", "OK");
            result.put("token", ourToken);

            return result;

        } catch (Exception ex) {
            ex.printStackTrace();
            result.put("status", JSON_STATUS_FAIL);
            result.put("message", "Ouch! something went wrong, sorry. Detail: " + ex.toString());
            result.put("token", "");
            return result;
        }
    }

    //ajax - me
    @RequestMapping
    public AppUser me(AppUser user) {
        //to get the whole object graph
        return chatService.getUser(user.getId());
    }

    //ajax - team with users
    @RequestMapping
    public Map team(AppUser user, @RequestParam Integer id) {
        Map result = new HashMap();

        //collect all the errors
        List<String> errors = new LinkedList();

        //to get the channel with subscribed users;
        Team team = chatService.getTeam(id);
        if (team == null) errors.add("Team does not exist");

        //check if this user is in this team
        AppUser appUser = chatService.getUser(user.getId());
        if (appUser == null) errors.add("Internal error, can't find user.");
        if (team != null && appUser != null && !appUser.checkTeam(team.getId())) errors.add("You cannot get this team");

        //return all of the error(s)
        if (!errors.isEmpty()) {
            result.put("status", JSON_STATUS_FAIL);
            result.put("message", "Get team failed");
            result.put("errors", errors);
            return result;
        }

        //return the success status
        result.put("status", JSON_STATUS_SUCCESS);
        result.put("message", "OK");
        result.put("team", team);
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


    //ajax - bulk save messages - private API
    @RequestMapping()
    public Map saveMessages(@RequestBody String messages) {
        Map result = new HashMap();
        
        //get the messages to be saved in Ilgaz's format
        MessageFormat[] msgArray = new Gson().fromJson(messages, MessageFormat[].class);
        
        //convert to message object
        List<Message> msgList = new LinkedList();
        for (MessageFormat msg :msgArray){
            Message message = new Message();
            message.setMessage(msg.txt);
            message.setSender(new AppUser((int)msg.uid));
            message.setDate(new Date(msg.ts));
            message.setChannel(new Channel((int)msg.channel));
            message.setId(null);
            msgList.add(message);
        }
        
        //save for search
        searchService.saveMessages(msgList);

        //return the success status
        result.put("status", JSON_STATUS_SUCCESS);
        result.put("message", "OK");
        return result;
    }

    //ajax - get messages - private API
    @RequestMapping()
    public List<Message> getMessages(@RequestParam Integer channelId, @RequestParam Long date) {
        return searchService.loadMessages(channelId, date);
    }


    //--------------------------------------------------------------------------
    //SETTERS
    //--------------------------------------------------------------------------

    @Autowired
    public void setChatService(ChatService chatService) {
        this.chatService = chatService;
    }

    @Autowired
    public void setSearchService(SearchService searchService) {
        this.searchService = searchService;
    }
    
}

//Ilgaz's message format
class MessageFormat {
    public long uid;
    public long channel;
    public long ts;
    public String txt;

    @Override
    public String toString() {
        return "" + uid + " " + channel + " " + ts + " " + txt;
    }
}
