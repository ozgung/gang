/*
 *  GangServer
 *  Copyright 2015 The Gang Chat Company.
 * 
 *  All rights reserved.
 */
package com.gangchat.service.search;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.gangchat.service.chat.domain.Message;
import java.nio.charset.Charset;
import java.util.Arrays;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

/**
 * Search Service, handles message persistence and search using ElasticSearch
 *
 * @author Fatih Mehmet Güler
 */
public class SearchService {
    private RestTemplate restTemplate = null;
    private MappingJackson2HttpMessageConverter jsonConverter = null;
    private StringHttpMessageConverter stringConverter = null;
    private String url = "http://localhost:9200/gang";


    //initalize the ES
    public void init() {
        restTemplate = new RestTemplate();

        for (HttpMessageConverter c : restTemplate.getMessageConverters()) {
            if (c instanceof MappingJackson2HttpMessageConverter) {
                jsonConverter = (MappingJackson2HttpMessageConverter)c;
                jsonConverter.getObjectMapper().setSerializationInclusion(JsonInclude.Include.NON_NULL);
            }
            if (c instanceof StringHttpMessageConverter) {
                stringConverter = (StringHttpMessageConverter)c;
                stringConverter.setSupportedMediaTypes(Arrays.asList(new MediaType("application", "json", Charset.forName("UTF-8"))));
            }
        }
    }

    /**
     * Save the messages, persist and make ready for search
     *
     * @param messages the messages to be saved
     */
    public void saveMessages(List<Message> messages) {
        try {
            StringBuilder sb = new StringBuilder();
            for (Message msg : messages) {
                sb.append("{\"index\":{\"_id\":\"" + msg.getChannel().getId() + "_" + msg.getDate().getTime() + "\"}}");
                sb.append('\n');
                sb.append(new String(jsonConverter.getObjectMapper().writer().writeValueAsString(msg)));
                //sb.append(gson.toJson(msg));
                sb.append('\n');
            }
            String resultStr = restTemplate.postForObject(url + "/message/_bulk", sb.toString(), String.class);
            //TODO: check for errors, etc
        } catch (Exception ex) {
            System.err.println("SearchService: error saving messages: " + ex);
            ex.printStackTrace();
        }
    }
}
