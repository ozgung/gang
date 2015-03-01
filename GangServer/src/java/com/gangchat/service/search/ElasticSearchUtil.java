/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.service.search;

import com.fasterxml.jackson.annotation.JsonFilter;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.gangchat.service.chat.domain.AppUser;
import com.gangchat.service.chat.domain.Channel;
import com.gangchat.service.chat.domain.Message;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

/**
 *
 * @author Fatih
 */
public class ElasticSearchUtil {

    //test
    public static void main(String[] args) throws JsonProcessingException, UnsupportedEncodingException {
        RestTemplate restTemplate = new RestTemplate();

        String url = "http://localhost:9200/gang";
        ServerResult result = null;

        /*
         result = restTemplate.getForObject(url + "/message/{id}", ServerResult.class, "1");
         System.out.println(new com.google.gson.Gson().toJson(result));
         System.out.println(result._source);
         if (true) return;
         //*/

        //restTemplate.delete(url + "/message/{id}", 2);

        MappingJackson2HttpMessageConverter jsonConverter = null;
        for (HttpMessageConverter c : restTemplate.getMessageConverters()) {
            if (!(c instanceof MappingJackson2HttpMessageConverter)) continue;
            jsonConverter = (MappingJackson2HttpMessageConverter)c;
            jsonConverter.getObjectMapper().setSerializationInclusion(Include.NON_NULL);
        }

        Message m = new Message();
        m.setId(3);
        m.setSender(new AppUser(3));
        m.setChannel(new Channel(3));
        m.setMessage("bu bir test mesajıdır üç");
        m.setDate(new Date());

        /*
         //single create 
         result = restTemplate.postForObject(url + "/message/{id}", m, ServerResult.class, 3);
         System.out.println(new com.google.gson.Gson().toJson(result));
         //*/


        //bulk create
        List<Message> messages = new LinkedList();
        for (int i = 1; i < 10; i++) {
            m = new Message();
            m.setId(i);
            m.setSender(new AppUser(i));
            m.setChannel(new Channel(i));
            m.setMessage("bu bir test mesajıdır " + i);
            m.setDate(new Date());
            messages.add(m);
        }

        StringBuilder sb = new StringBuilder();
        for (Message msg : messages) {
            sb.append("{\"index\":{\"_id\":\"" + msg.getId() + "\"}}");
            sb.append('\n');
            sb.append(new String(jsonConverter.getObjectMapper().writeValueAsBytes(msg), "UTF-8"));
            sb.append('\n');
        }

        String resultStr = restTemplate.postForObject(url + "/message/_bulk", sb.toString(), String.class);
        System.out.println(resultStr);

    }

}

class ServerResult {
    public String _index;
    public String _type;
    public String _id;
    public Integer _version;
    public Boolean found;
    public Boolean created;
    //public Map _source;
    public Message _source;
}

@JsonFilter("filter properties by name")
class PropertyFilterMixIn {
}
