package com.ganghq;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

import gui.ava.html.image.generator.HtmlImageGenerator;
import org.xml.sax.SAXException;
import sun.misc.IOUtils;

/**
 * Created by ozgun on 01/03/15.
 */
public class MetaImageGenerator {

    private String htmlTemplate;
    private HtmlImageGenerator htmlImageGenerator;
    private ImageRenderer renderer;
    private String filepath;


    public MetaImageGenerator(String templateFileName) throws IOException {
        filepath = "file:///Users/ozgun/Dev/gang/GangMetaImage/src/test2.html";

        htmlTemplate = readFile(templateFileName);
        //htmlImageGenerator = new HtmlImageGenerator();


        //System.out.println(htmlTemplate);

        renderer = new ImageRenderer();

    }

    public OutputStream generateImage(String[] strParams) throws IOException, SAXException {
        String html = this.htmlTemplate;
        for (int i = 0; i < strParams.length; i++){
            html = html.replaceAll("\\{"+ i +"\\}", strParams[i]);
        }
        System.out.println(html);

        // use renderer
        renderer.setMediaType("screen");
        renderer.setWindowSize(new Dimension(1200,630), true);
        FileOutputStream os = new FileOutputStream("out.png");
        InputStream stream = new ByteArrayInputStream(html.getBytes(StandardCharsets.UTF_8));
        OutputStream ostream = new ByteArrayOutputStream();


        renderer.renderStream(stream, os, ImageRenderer.Type.PNG);
        //os.close();

        //htmlImageGenerator.loadHtml(html);
        //htmlImageGenerator.saveAsImage("generatedImage.png");
        return os;
    }

    private static String readFile(String fileName) throws IOException {
        BufferedReader br;
        br = new BufferedReader(new FileReader(fileName));
        try {
            StringBuilder sb = new StringBuilder();
            String line = br.readLine();

            while (line != null) {
                sb.append(line);
                sb.append("\n");
                line = br.readLine();
            }
            return sb.toString();
        } finally {
            br.close();
        }
    }

}
