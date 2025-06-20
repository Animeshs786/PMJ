function generateHTML(notebook) {
  let noteContent = "";
  notebook.forEach((note) => {
    noteContent += `<p style="margin-top: 30px;">
      ${
        note.message
          ? `<ul>
              <li>
                  <span class="p">${note.message}</span>
              </li>
          </ul>`
          : ""
      }
      
          ${
            note.image
              ? `<table style="margin-top:40px;" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <img
                    width="700"
                    height="350"
                    src="http://142.93.208.153:4008/${note.image}"
                  />
                </td>
              </tr>
          </table>`
              : ""
          }
      </p>`;
  });

  let htmlContent = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <title>Notebook</title>
      <style type="text/css">
        * {
          margin: 0;
          padding: 0;
          text-indent: 0;
        }
        .p,
        p {
          color: black;
          font-family: "Gill Sans MT", sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 16pt;
          margin: 0pt;
        }
        .s1 {
          color: #878787;
          font-family: "Gill Sans MT", sans-serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 14pt;
        }
        .s2 {
          color: black;
          font-family: "Times New Roman", serif;
          font-style: normal;
          font-weight: normal;
          text-decoration: none;
          font-size: 12pt;
        }
      </style>
    </head>
    <body style="padding:0 50px">
      <p style="padding-left: 8pt; text-indent: 0pt; text-align: left">
        <span
          ><table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <img
                  width="187"
                  height="53"
                  src="https://examdaur.in/wp-content/uploads/2024/04/examdouar-logo.png"
                />
              </td>
            </tr></table
        ></span>
      </p>
      <p style="text-indent: 0pt; text-align: left"><br /></p>
      <p style="padding-left: 8pt; text-indent: 0pt; text-align: left">
        ${notebook[0]?.class?.title}
      </p>
      <p style="text-indent: 0pt; text-align: left"><br /></p>
      <p style="padding-top: 3pt; text-indent: 0pt; text-align: left"><br /></p>
      <p style="padding-left: 0pt; text-indent: 0pt; text-align: left">
        Your Notes
      </p>
      
      ${noteContent}
      </body>
  </html>
  `;

  return htmlContent;
}

module.exports = generateHTML;
