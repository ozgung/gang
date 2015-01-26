<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Gang Debug</title>
    </head>

    <body>
        <p>Hello! If you see this message it means there's no HTML view for this request</p>
        <p><i>Call with .json extension to get the JSON result</i></p>
        
        <p>Status: <strong>${status}</strong></p>
        <p>Message: <strong>${message}</strong></p>
        
    </body>
</html>
