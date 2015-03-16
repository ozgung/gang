/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.service.search;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.gangchat.service.chat.domain.AppUser;
import com.gangchat.service.chat.domain.Channel;
import com.gangchat.service.chat.domain.Message;
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
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
         System.out.println(new Date().getTime());
         if (true) return;
         /*/

        /*
         result = restTemplate.getForObject(url + "/message/{id}", ServerResult.class, "1");
         System.out.println(new com.google.gson.Gson().toJson(result));
         System.out.println(result._source);
         if (true) return;
         //*/

        //restTemplate.delete(url + "/message/{id}", 2);

        MappingJackson2HttpMessageConverter jsonConverter = null;
        StringHttpMessageConverter stringConverter = null;
        for (HttpMessageConverter c : restTemplate.getMessageConverters()) {
            if (c instanceof MappingJackson2HttpMessageConverter) {
                jsonConverter = (MappingJackson2HttpMessageConverter)c;
                jsonConverter.getObjectMapper().setSerializationInclusion(Include.NON_NULL);
            }
            if (c instanceof StringHttpMessageConverter) {
                stringConverter = (StringHttpMessageConverter)c;
                stringConverter.setSupportedMediaTypes(Arrays.asList(new MediaType("application", "json", Charset.forName("UTF-8"))));
            }
        }


        /*
         result = restTemplate.getForObject(url+"/_search?q=*", ServerResult.class);
         System.out.println(new com.google.gson.Gson().toJson(result));
         if (true) return;
         //*/

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
        /*
         List<Message> messages = new LinkedList();
         for (int i = 1; i < 10; i++) {
         m = new Message();
         m.setSender(new AppUser(i));
         m.setChannel(new Channel(i));
         m.setMessage("bu bir test mesajıdır " + i);
         m.setDate(new Date());
         messages.add(m);
         }

         StringBuilder sb = new StringBuilder();
         for (Message msg : messages) {
         sb.append("{\"index\":{\"_id\":\"" + msg.getChannel().getId() + "_" + msg.getDate().getTime() + "\"}}");
         sb.append('\n');
         sb.append(new String(jsonConverter.getObjectMapper().writer().writeValueAsString(msg)));
         //sb.append(gson.toJson(msg));
         sb.append('\n');
         }

         System.out.println(sb.toString());
         String resultStr = restTemplate.postForObject(url + "/message/_bulk", sb.toString(), String.class);
         System.out.println(resultStr);
         */

        //load

        long date = 1425415959775L;
        long startDate = 1425415959775L - 1000;
        int channelId = 3;

        String query = "{\n"
                + "  \"query\": {\n"
                + "    \"filtered\": {\n"
                + "      \"query\": { \"match_all\": {} },\n"
                + "      \"filter\": {\n"
                + "        \"and\": [\n"
                + "            {\n"
                + "                \"range\": {\n"
                + "                    \"date\": {\"lt\": " + date + "}\n"
                + "                }\n"
                + "            },\n"
                + "            {\n"
                + "               \"term\" : { \"channel.id\" : " + channelId + "}\n"
                + "            } \n"
                + "        ]          \n"
                + "      }\n"
                + "    }\n"
                + "  },\n"
                + "\"sort\": { \"date\": { \"order\": \"desc\" }},"
                + "  \"size\": 50\n"
                + "}";

        System.out.println(query);

        result = restTemplate.postForObject(url + "/message/_search", query, ServerResult.class);
        for (ServerResult h : result.hits.hits) {
            System.out.println(new com.google.gson.Gson().toJson(h._source));
        }

    }

}
