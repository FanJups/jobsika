import { expect } from "chai";
import request from "supertest";
import dotenv from "dotenv";

dotenv.config();
const apiHost = process.env.API_HOST;
const endpoint = "ratings";

describe(`${endpoint}`, function () {
  describe("GET", function () {
    it("return a list of ratings with page=1 & limit=2", async function () {
      return request(apiHost)
        .get(`${endpoint}?page=1&limit=2`)
        .send()
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .then((res) => {
          const body = JSON.stringify(res.body)
          expect(body).contains('"hits":');
          expect(body).contains('"limit":2,"nbHits":100,"offset":0}');
        });
    });

    it("return a list of ratings with page=3", async function () {
      return request(apiHost)
        .get(`${endpoint}?page=3`)
        .send()
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .then((res) => {
          const body = JSON.stringify(res.body)
          expect(body).contains('"hits":');
          expect(body).contains('"limit":20,"nbHits":100,"offset":40}');
        });
    });

    it("return a list of ratings with jobtitle=Statistician II", async function () {
      return request(apiHost)
        .get(`${endpoint}?jobtitle=Statistician II`)
        .send()
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .then((res) => {
          const body = JSON.stringify(res.body)
          expect(body).contains('"hits":');
          expect(body).contains('"limit":20,"nbHits":16,"offset":0}');
        });
    });

    it("return a list of ratings with company=Fliptune and jobtitle=Statistician II", async function () {
      return request(apiHost)
        .get(`${endpoint}?company=Fliptune&jobtitle=Statistician II`)
        .send()
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .then((res) => {
          const body = JSON.stringify(res.body)
          expect(body).contains('"hits":');
          expect(body).contains('"limit":20,"nbHits":1,"offset":0}');
        });
    });

    it("return a list of ratings with company=Jaxbean", async function () {
      return request(apiHost)
        .get(`${endpoint}?company=Jaxbean`)
        .send()
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .then((res) => {
          const body = JSON.stringify(res.body)
          expect(body).contains('"hits":');
          expect(body).contains('"limit":20,"nbHits":1,"offset":0}');
        });
    });

    it("return a rating of id == 1", async function () {
      return request(apiHost)
        .get(`${endpoint}/1`)
        .send()
        .expect(200)
        .expect("content-type", "application/json; charset=utf-8")
        .then((res) => {
          expect(JSON.stringify(res.body)).to.equal('{"salary_id":1,"company_id":0,"company_rating_id":0,"rating":0,"salary":1624669,"company_name":"","seniority":"Seniority","comment":"","job_title":"Assistant Manager","country":"Country","city":"Ndop","createdat":"0001-01-01T00:00:00Z"}');
        });
    });

    it("return 404 for an non existing rating id", async function () {
      return request(apiHost)
        .get(`${endpoint}/1001`)
        .send()
        .expect(404)
        .expect("content-type", "application/json; charset=utf-8")
        .then((res) => {
          expect(JSON.stringify(res.body)).contains('could not find rating');
        });
    });

    it("List ratings of city = Maroua", async function () {
          return request(apiHost)
              .get(`${endpoint}?city=Maroua`)
              .send()
              .expect(200)
              .expect("Content-Type", "application/json; charset=utf-8")
              .then((res) => {
                  const data = res.body.hits;
                  expect(data.every(v => v.city === 'Maroua')).equal(true)
              });
      });

      it("List ratings with seniority = Seniority", async function () {
          return request(apiHost)
              .get(`${endpoint}?seniority=seniority`)
              .send()
              .expect(200)
              .expect("Content-Type", "application/json; charset=utf-8")
              .then((res) => {
                  const data = res.body.hits;
                  expect(data.every(v => v.seniority === 'Seniority')).equal(true)
              });
      });
  });

});

const endpoint2 = `average-rating`
describe(`${endpoint2}`, function () {
  describe("GET", function () {
    it("return the average of ratings", async function () {
      return request(apiHost)
        .get(endpoint2)
        .send()
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .then((res) => {
          expect(JSON.stringify(res.body)).equal(
            '{"rating":4,"salary":2494171}'
          );
        });
    });

    it("return the average of ratings with jobtitle=Statistician II", async function () {
      return request(apiHost)
        .get(`${endpoint2}?jobtitle=Statistician II`)
        .send()
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .then((res) => {
          expect(JSON.stringify(res.body)).equal(
            '{"rating":4,"salary":2824939}'
          );
        });
    });

    it("return the average of ratings with company=Jaxbean", async function () {
      return request(apiHost)
        .get(`${endpoint2}?company=Jaxbean`)
        .send()
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .then((res) => {
          expect(JSON.stringify(res.body)).equal(
            '{"rating":0,"salary":1624669}'
          );
        });
    });

    it("return a list of ratings with company=Fliptune and jobtitle=Statistician II", async function () {
      return request(apiHost)
        .get(`${endpoint2}?company=Fliptune&jobtitle=Statistician II`)
        .send()
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .then((res) => {
          expect(JSON.stringify(res.body)).equal(
            '{"rating":0,"salary":841396}'
          );
        });
    });

      it("add 2 rating entry for one company, one with rating set to 0 and another set to 5, the result should be 5 instead of 2", async function() {
          const sendRequest = (rating) =>
              request(apiHost)
                  .post(`${endpoint}`)
                  .set("Accept", "application/json")
                  .send({
                      company_name: "Oss",
                      job_title: "technicien de surface",
                      //we set the salary to zero to avoid breaking the average-ratings tests
                      //as the salary set -1 are not counted in the calculation of the average
                      salary: 0,
                      //we set the rating to zero to avoid breaking the average-ratings tests
                      //as the rating set -1 are not counted in the calculation of the average
                      rating: rating,
                      comment: "my comment",
                      seniority: "Seniority",
                      city: "maroua",
                      //the country field is omitted here as we always set it to Cameroon for now
                  })
                  .expect(201)
                  .expect("Content-Type", "application/json; charset=utf-8");

          await sendRequest(0)
          await sendRequest(5)

          return request(apiHost)
              .get(`${endpoint2}?company=Oss`)
              .set("Accept", "application/json")
              .send()
              .expect(200)
              .expect("Content-Type", "application/json; charset=utf-8")
              .then((res) => {
                  const averageRating = res.body.rating;
                  expect(averageRating).equal(5);
              });
      });

    it("List only companies who hasn't salaries entries between 1 and maxEntryBeforeDisplay - 1", async function () {
        const sendRequest = () => request(apiHost)
              .post(endpoint)
              .set("Accept", "application/json")
              .send({
                  company_name: "Elhmnco",
                  //we set the salary to zero to avoid breaking the average-ratings tests
                  //as the salary set -1 are not counted in the calculation of the average
                  salary: 0,
                  //we set the rating to zero to avoid breaking the average-ratings tests
                  //as the rating set -1 are not counted in the calculation of the average
                  rating: 0,
                  job_title: "A Job_title",
                  comment: "my comment",
                  seniority: "Seniority",
                  city: "Maroua",
              })
              .expect(201)
              .expect("content-type", "application/json; charset=utf-8");

        await sendRequest()

        request(apiHost)
            .get("companies")
            .send()
            .expect(200)
            .expect("Content-Type", "application/json; charset=utf-8")
            .then((res) => {
                expect(JSON.stringify(res.body)).to.not.contains('"name":"Elhmnco"');
            });

        for (let i = 0; i < 3; i++) {
            await sendRequest();
        }

        return request(apiHost)
            .get("companies")
            .send()
            .expect(200)
            .expect("Content-Type", "application/json; charset=utf-8")
            .then((res) => {
                expect(JSON.stringify(res.body)).contains('"name":"Elhmnco"');
            });
      });
  });
});
