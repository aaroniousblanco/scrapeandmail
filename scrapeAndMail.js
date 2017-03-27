var request = require('request-promise');
var cheerio = require('cheerio');
var mailer = require('nodemailer-promise');
var fs = require('fs-promise');

// var options = { //THIS IS THE OPTION OBJECT TEMPLATE FOR THE MODULE
//   url: url,
//   cssSelectorPath: cssSelectorPath,
//   selectorMethod: selectorMethod,
//   methodElement: methodElement/undefined,
//   headers: {
//     'User-Agent': 'Scape and Mail'
//   },
//   server: server,
//   senderPassword: senderPassword,
//   senderAddress: senderAddress, // sender address,
//   senderName: senderName,
//   receiver: receiver, // list of receivers
//   subjectLine: subjectLine
//   filename: outputFileName,
//   path: '/path/to/file.txt' // stream this file
// };

function scrapeAndMail(options) {
  var cssSelectorPath = options.cssSelectorPath;
  var selectorMethod = options.selectorMethod;
  var methodElement = options.methodElement;
  var server = options.server;
  var senderPassword = options.senderPassword;
  var senderAddress = options.senderAddress;
  var senderName = options.senderName;
  var receiver = options.receiver;
  var subjectLine = options.subjectLine;
  var filename = options.outputFileName;
  var path = options.path;
  var arrayOfElements = [];
  var sendEmail = mailer.config({ // setup email data
      email: senderAddress,
      password: senderPassword,
      server: server
  });

    return request(options) //request module gets html data from passed in url
      .then(function(html) { //passes returned data into cheerio function below
        var $ = cheerio.load(html);
          $(cssSelectorPath).map(function(iterator, element) { //maps over array of elements that match the selector path
          if ($(this)[selectorMethod](methodElement) !== undefined && $(this)[selectorMethod](methodElement).length !== 0){ //checks to ensure returned elements aren't undefined and aren't non-existent (due to falty selector path, for example)
            arrayOfElements.push($(this)[selectorMethod](methodElement));//pushes elements to array
          } else if ($(this)[selectorMethod](methodElement).length === 0) { //returns an error message if the element is non-existent
            return "No element found"; //THIS ISN'T RETURNING THE ERROR; HOW DO I PROMISIFY THIS???
          }
        });
        var forEmail = arrayOfElements.join("\n");
        return fs.writeFile(filename, forEmail);
        })
      .then(function(outputFileName) {
        var mailOptions = {
          senderName: senderName, // sender address
          receiver: receiver, // list of receivers
          subject: subjectLine, // Subject line
          text: "Here's your scraped content", // plain text body
          html: "<b>" + "Your scraped content is attached." + "</b>", // html body
          attachments: [ //attachments for email
            {
              filename: outputFileName,
              path: path
            }
          ]
        };
        return sendEmail(mailOptions); // send mail
      })
      .then(function(info) { //passes email meta data and prints to console on success
        console.log(info);
      });

}

//CAN USE bluebird PROMISE.MAP with map to handle multiple option objects being passed in; MAY NEED TO USE BASIC MAP FUNCTION TO CREATE AN ARRAY OF THE PROMISES TO REQUEST.GET THE OPTION OBJECTS

exports.scrapeAndMail = scrapeAndMail;
