const http = require('http')
const url = require('url')
const {StringDecoder} = require('string_decoder')
require('dotenv').config()

const httpServer = http.createServer((req,res) => {
	bigServer(req,res)
})

httpServer.listen(process.env.HTTP_PORT, err => {
	!err ? console.log(`Servidor http ouvindo na porta ${process.env.HTTP_PORT}`) : console.error(err)
})

const bigServer = (req,res) => {
	const {parse} = url;
	const {pathname} = parse(req.url, true);
	const pathRegex = pathname.replace(/^\/+|\/+$/g,'');
	const {headers,method} = req;
	const {query} = parse(req.url,true);
 	const Decoder = new StringDecoder(process.env.ENCODING);	      let strBuffer = new String;
	
	req.on('data', streamInput => {
	  strBuffer += Decoder['write'](streamInput);
	})
	req.on('end', () => {
	  strBuffer += Decoder['end']();
	  const payloadReq = {
	  	path: pathRegex,
		headers,
		method,
		params: query,
		body: strBuffer,  
		parser: stream => {
	 	   console.log(typeof stream)
		   return stream !== null ? JSON.parse(stream) : {}
	 	}
	  }
	  const requestHandler = typeof router[pathRegex] !== 'undefined' ? router[pathRegex] : router['notFound']
	  requestHandler(payloadReq,res);	  
	})
}

const router = {
  ping: (payloadReq,res) => {
    res.setHeader('Content-Type','application/json');
    res.writeHead(200);
    res.end();
  },
  admin: (payloadReq,res) => {
    res.setHeader('Content-Type','application/json');
    const {method} = payloadReq;
       method === 'POST' ? (	  
	    payloadReq['body'] ? ( 
	      parsedBody = payloadReq.parser(payloadReq['body']),
	      parsedBody = typeof parsedBody.nome !== 'undefined' && typeof parsedBody.senha !== 'undefined' ? parsedBody: (
	      res.writeHead(500),
	      res.end(JSON.stringify({'Error':'Missing Required Fields'}))	      
	      ), 
	      delete payloadReq['body'],
	      payloadReq['body'] = parsedBody,
	      res.writeHead(200),
	      res.end(JSON.stringify(payloadReq))	    
	    ) : (
	      res.writeHead(400),
	      res.end()	    
	    )) : (
	      res.writeHead(405),
	      res.end()	    
       )
  },
  notFound: (payloadReq,res) => {
    res.setHeader('Content-Type','application/json');
    res.writeHead(404);
    res.end();	  
  }
}
