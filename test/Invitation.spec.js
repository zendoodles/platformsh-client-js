/* global afterEach, before*/

import { assert } from "chai";
import fetchMock from "fetch-mock";

import { getConfig } from "../src/config";
import { setAuthenticationPromise } from "../src/api";
import Invitation from "../src/model/Invitation";

describe("Invitation", () => {
  const { api_url } = getConfig();

  before(function() {
    setAuthenticationPromise(Promise.resolve("testToken"));
  });

  afterEach(function() {
    fetchMock.restore();
  });

  it("Get invitation", done => {
    fetchMock.mock(`${api_url}/projects/project_id/invitations/1`, {
      id: "1"
    });

    Invitation.get("project_id", "1").then(invitation => {
      assert.equal(invitation.id, "1");
      assert.equal(invitation.constructor.name, "Invitation");
      done();
    });
  });

  it("Get invitations", done => {
    const invitations = [
      { status: "pending", id: "1" },
      { status: "pending", id: "2" },
      { status: "pending", id: "3" }
    ];

    fetchMock.mock(`${api_url}/projects/project_id/invitations`, invitations);

    Invitation.query("project_id").then(invitation => {
      assert.equal(invitation.length, 3);
      assert.equal(invitation[1].id, "2");
      assert.equal(invitation[1].status, "pending");
      assert.equal(invitation[0].constructor.name, "Invitation");
      done();
    });
  });

  it("Delete invitation", done => {
    fetchMock.mock(`${api_url}/projects/project_id/invitations/1`, {
      provider: "github",
      subject: "1"
    });

    fetchMock.mock(
      `${api_url}/projects/project_id/invitations/1`,
      {},
      "DELETE"
    );

    Invitation.get("project_id", "1").then(invitation => {
      invitation.delete().then(result => {
        done();
      });
    });
  });

  it("Create invitation", done => {
    fetchMock.mock(`${api_url}/projects/project_id/invitations`, {}, "POST");

    const invitation = new Invitation({
      projectId: "project_id",
      environments: [],
      role: "view"
    });

    invitation.save().then(() => done());
  });
});
