// // GET test
// fetch("http://localhost:8081/api/v1/test/ping", {
//   method: "GET",
//   credentials: "include"
// })
// .then(r => r.text())
// .then(console.log)
// .catch(console.error);

// // POST test
// fetch("http://localhost:8081/api/v1/test/echo", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   credentials: "include",
//   body: JSON.stringify("Hello CORS!")
// })
// .then(r => r.text())
// .then(console.log)
// .catch(console.error);

import fetch from 'node-fetch';

(async () => {
  try {
    const res = await fetch("http://localhost:8084/api/v1/test/ping", {
      method: "GET"
    });
    console.log("Status:", res.status);
    console.log("Headers:", res.headers.raw());

    const text = await res.text();
    console.log("Body:", text);
  } catch (err) {
    console.error("Error:", err);
  }
})();
