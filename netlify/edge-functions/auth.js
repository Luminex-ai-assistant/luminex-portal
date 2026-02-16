export default async (request, context) => {
  const url = new URL(request.url);
  
  // Allow public access to landing page and assets
  const publicPaths = ['/', '/landing', '/landing.html', '/index.html'];
  const isPublicPath = publicPaths.includes(url.pathname) || 
                       url.pathname.match(/\.(css|js|png|jpg|ico|woff|woff2|json|txt)$/);
  
  if (isPublicPath) {
    return context.next();
  }

  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !isValidAuth(authHeader)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Luminex Command"',
        "Content-Type": "text/plain"
      }
    });
  }
  
  return context.next();
};

function isValidAuth(authHeader) {
  try {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme !== "Basic") return false;
    
    const decoded = atob(encoded);
    const [username, password] = decoded.split(":");
    
    // Credentials: tag / Command2026!
    return username === "tag" && password === "Command2026!";
  } catch (e) {
    return false;
  }
}

export const config = {
  path: "/dashboard/*"
};
