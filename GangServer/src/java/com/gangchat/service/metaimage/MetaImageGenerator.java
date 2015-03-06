package com.gangchat.service.metaimage;

import java.awt.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import gui.ava.html.image.generator.HtmlImageGenerator;
import org.xml.sax.SAXException;

/**
 * Created by ozgun on 01/03/15.
 */
public class MetaImageGenerator {
    private String htmlTemplate;
    private HtmlImageGenerator htmlImageGenerator;
    private ImageRenderer renderer;


    public MetaImageGenerator(String templateFileName) throws IOException {
        htmlTemplate = readFile(templateFileName);
        renderer = new ImageRenderer();
    }

    public void generateImage(String[] strParams, OutputStream os) throws IOException, SAXException {
        String html = this.htmlTemplate;
        for (int i = 0; i < strParams.length; i++) {
            html = html.replaceAll("\\{" + i + "\\}", strParams[i]);
        }

        // use renderer
        renderer.setMediaType("screen");
        renderer.setWindowSize(new Dimension(1200, 630), true);
        InputStream stream = new ByteArrayInputStream(html.getBytes(StandardCharsets.UTF_8));
        renderer.renderStream(stream, os, ImageRenderer.Type.PNG);
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
