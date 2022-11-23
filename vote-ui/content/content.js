const { ref } = Vue;

const template = `
    <div id="content-container">
      <div id="content-container-center">
        <h3>{{option_a}} vs {{option_b}}!</h3>

        <form id="choice" name="form" @submit.prevent.default>
          <button id="a"
            @click="select('a')" :class="['a', { 'opacity-unselected': current_vote === 'b' }]"
            :disabled="current_vote === 'a'"
            value="a">{{option_a}}</button>

          <button id="b"
            @click="select('b')"
            :disabled="current_vote === 'b'"
            :class="['b', { 'opacity-unselected': current_vote === 'a' }]"
            value="b">{{option_b}}</button>

        </form>

        <div id="hostname" v-if="hostname !== ''">
          Handled by container {{hostname}}
        </div>
        <div id="backend" v-if="backend === 'NATS'">
          <img src="./images/nats.png" height="25"/>
        </div>
      </div>
    </div>
`;

export default {
  template,
  setup() {
    const option_a = 'Cats';
    const option_b = 'Dogs';
    const hostname = ref('');
    const voter_id = ref('');
    const backend = ref('');
    const current_vote = ref('');

    const select = (vote) => {
      current_vote.value = vote;

      fetch('/api', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vote, voter_id: voter_id.value }),
      }).then(function (res) {
        return res.json();
      }).then(function (res) {
        console.log(res);
        hostname.value = res.hostname;
        voter_id.value = res.voter_id;
        backend.value = res.backend;
      })

    }
    return {
      option_a,
      option_b,
      hostname,
      backend,
      select,
      current_vote,
    }
  }
}
