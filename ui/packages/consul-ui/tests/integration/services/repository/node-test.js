import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import repo from 'consul-ui/tests/helpers/repo';
import { get } from '@ember/object';

const dc = 'dc-1';
const id = 'token-name';
const now = new Date().getTime();
const nspace = 'default';
const partition = 'default';
module(`Integration | Service | node`, function(hooks) {
  setupTest(hooks);

  test('findByDatacenter returns the correct data for list endpoint', function(assert) {
    const subject = this.owner.lookup('service:repository/node');
    get(subject, 'store').serializerFor('node').timestamp = function() {
      return now;
    };
    return repo(
      'Node',
      'findAllByDatacenter',
      subject,
      function retrieveStub(stub) {
        return stub(
          `/v1/internal/ui/nodes?dc=${dc}${
            typeof partition !== 'undefined' ? `&partition=${partition}` : ``
          }`,
          {
            CONSUL_NODE_COUNT: '100',
          }
        );
      },
      function performTest(service) {
        return service.findAllByDatacenter({ dc, partition });
      },
      function performAssertion(actual, expected) {
        actual.forEach(item => {
          assert.equal(item.uid, `["${partition}","${nspace}","${dc}","${item.ID}"]`);
          assert.equal(item.Datacenter, dc);
        });
      }
    );
  });
  test('findBySlug returns the correct data for item endpoint', function(assert) {
    const subject = this.owner.lookup('service:repository/node');

    return repo(
      'Node',
      'findBySlug',
      subject,
      function(stub) {
        return stub(
          `/v1/internal/ui/node/${id}?dc=${dc}${
            typeof partition !== 'undefined' ? `&partition=${partition}` : ``
          }`
        );
      },
      function(service) {
        return service.findBySlug({ id, dc, partition });
      },
      function(actual, expected) {
        assert.equal(actual.uid, `["${partition}","${nspace}","${dc}","${actual.ID}"]`);
        assert.equal(actual.Datacenter, dc);
      }
    );
  });
});
