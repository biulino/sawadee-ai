package com.canermastan.hotel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean("timeoutRestTemplate")
    public RestTemplate timeoutRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10 saniye
        factory.setReadTimeout(30000);    // 30 saniye
        
        RestTemplate restTemplate = new RestTemplate(
            new BufferingClientHttpRequestFactory(factory)
        );
        
        return restTemplate;
    }
}