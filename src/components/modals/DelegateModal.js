const utils = require('../../utils')

module.exports = {
  template: `
    <ModalWindow
      container-classes="max-w-md w-md"
      @close="emitClose"
    >
      <template #header>
        <div class="flex items-center">
          <h2>{{ delegate.name }}</h2>

          <span
            v-if="!delegate.isClaimed"
            v-tooltip="{
              content: 'The delegate has not claimed his account and the information shown is likely to be inaccurate',
              trigger: 'hover',
              classes: 'text-xs max-w-xs',
              placement: 'right'
            }"
            class="bg-red text-white text-xs text-center font-semibold rounded py-1 px-2 ml-2"
          >
            Unclaimed
          </span>

          <span
            v-tooltip="{
              content: delegate.isPrivate ? 'You may not receive any rewards from this delegate' : '',
              trigger: 'hover',
              classes: 'text-xs',
              placement: 'right'
            }"
            class="text-white text-xs text-center font-semibold rounded py-1 px-2 ml-2"
            :class="delegate.isPrivate ? 'bg-red' : 'bg-green'"
          >
            {{ delegate.isPrivate ? 'Private' : 'Public' }} 
          </span>
        </div>
      </template>

      <ListDivided>
        <ListDividedItem
          label="Rank"
          :value="delegate.rank"
        />

        <ListDividedItem
          label="Votes"
          :value="formatCurrency(delegate.votes, 'ARK')"
        />

        <ListDividedItem
          v-if="delegate.website"
          label="Website"
          :value="delegate.website"
        />
      </ListDivided>

      <h3 class="mt-4 mb-3">Payout</h3>

      <ListDivided>
        <ListDividedItem
          label="Shared Percentage"
          :value="delegate.payout.percentage + '%'"
        />

        <ListDividedItem
          label="Interval"
          :value="delegate.payout.interval + 'h'"
        />

        <ListDividedItem
          v-if="delegate.payout.minimum"
          label="Minimum Payout"
          :value="formatCurrency(delegate.payout.minimum, 'ARK')"
        />

        <ListDividedItem
          v-if="delegate.payout.maximum"
          label="Maximum Payout"
          :value="formatCurrency(delegate.payout.minimum, 'ARK')"
        />

        <ListDividedItem
          v-if="delegate.payout.payout_minimum_vote_amount"
          label="Minimum Required Vote-Weight"
          :value="formatCurrency(delegate.payout.payout_minimum_vote_amount, 'ARK')"
        />

        <ListDividedItem
          v-if="delegate.payout.payout_maximum_vote_amount"
          label="Maximum Regarded Vote-Weight"
          :value="formatCurrency(delegate.payout.payout_maximum_vote_amount, 'ARK')"
        />
      </ListDivided>

      <h3 class="mt-4 mb-3">Contributions</h3>

      <div v-if="delegate.contributions.count">
        <ListDivided>
          <ListDividedItem
            label="Count"
            :value="delegate.contributions.count"
          />

          <ListDividedItem
            label="Days Since Last"
            :value="delegate.contributions.last || '0'"
          />

          <ListDividedItem
            label="Status"
            :value="statusText"
          />
        </ListDivided>
      </div>

      <span v-else>
        This delegate hasn't published any contributions.
      </span>

      <template #footer>
        <footer class="rounded-lg mt-2 text-sm shadow bg-yellow-lighter text-grey-darkest px-16 py-8">
          Visit <span class="font-semibold">https://arkdelegates.live/delegate/{{ delegate.name }}</span> for the full proposal
        </footer>
      </template>
    </ModalWindow>
  `,

  props: {
    delegate: {
      type: Object,
      required: true
    },
    callback: {
      type: Function,
      required: true
    }
  },

  computed: {
    profile () {
      return walletApi.profiles.getCurrent()
    },

    statusText () {
      return utils.upperFirst(this.delegate.contributions.status)
    }
  },

  methods: {
    executeCallback (event) {
      this.callback({
        component: 'DelegateModal',
        event
      })
    },

    emitClose () {
      this.executeCallback('close')
    },

    formatCurrency (value, currency) {
      const balance = Number(value) / 1e8
      return utils.formatter_currency(balance, currency, this.profile.language)
    }
  }
}
