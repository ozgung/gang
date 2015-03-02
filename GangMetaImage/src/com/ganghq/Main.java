package com.ganghq;

import org.xml.sax.SAXException;

import java.io.IOException;
import java.io.OutputStream;

public class Main {

    public static void main(String[] args) {

        System.out.println("main started");
        MetaImageGenerator generator = null;
        try {
            generator = new MetaImageGenerator("src/test2.html");
            System.out.println("generator created");
            String teamNames[] = {"istanbul startups", "cilgin javacilar"};
            System.out.println(teamNames);
            OutputStream out = generator.generateImage(teamNames);
            out.close();
            System.out.println("the end");
        } catch (IOException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            e.printStackTrace();
        }

    }

}
