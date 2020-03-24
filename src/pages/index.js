const DelegateModal = require('../components/modals/DelegateModal')
const DelegateTable = require('../components/DelegateTable')
const DisclaimerModal = require('../components/modals/DisclaimerModal')
const Footer = require('../components/Footer')
const Header = require('../components/Header')

const ImageService = require('../services/image.service.js')

module.exports = {
  template: `
    <div class="flex flex-col flex-1 overflow-y-auto">
      <div
        v-if="!hasWallets || hasWrongNetwork"
        class="relative flex flex-col flex-1 justify-center items-center rounded-lg bg-theme-feature"
      >
        <div class="flex flex-col items-center">
          <img :src="logoImage" class="mb-10 rounded-lg">

          <template v-if="!hasWallets">
            <p class="mb-5">
              Your profile has no wallets yet.
            </p>

            <button
              class="flex items-center text-blue hover:underline"
              @click="goTo('wallet-import')"
            >
              Import a wallet now
            </button>
          </template>

          <template v-else>
            <p class="mb-5">
              This plugin works only on the ARK Main network.
            </p>

            <button
              class="flex items-center text-blue hover:underline"
              @click="goTo('profiles')"
            >
              Select a different profile
            </button>
          </template>
        </div>
      </div>

      <div
        v-else-if="wallet"
        class="flex flex-col flex-1 overflow-y-hidden"
      >
        <Header
          :wallet="wallet"
          :callback="handleEvent"
        />

        <div class="flex flex-col flex-1 p-10 rounded-lg bg-theme-feature overflow-y-auto">
          <div class="flex flex-1">
            <div
              v-if="isLoading"
              class="relative flex items-center mx-auto w-md"
            >
              <div class="mx-auto">
                <Loader />
              </div>
            </div>

            <div
              v-else
              class="w-full"
            >
              <DelegateTable
                v-if="delegates.length"
                :rows="delegates"
                :current-page="1"
                :per-page="51"
                :callback="handleEvent"
              />
            </div>
          </div>
        </div>
      </div>

      <DelegateModal
        v-if="showDelegateModal"
        :delegate="selectedDelegate"
        :callback="handleEvent"
      />

      <DisclaimerModal
        v-if="!options.hasAcceptedDisclaimer"
        :callback="handleEvent"
      />

      <Footer />
    </div>
  `,

  components: {
    DelegateModal,
    DisclaimerModal,
    DelegateTable,
    Footer,
    Header
  },

  data: () => ({
    address: '',
    isLoading: false,
    wallet: {
      address: '',
      balance: '',
      vote: ''
    },
    delegateData: [],
    delegates: [],
    selectedDelegate: null,
    showDelegateModal: false
  }),

  async mounted () {
    this.address = walletApi.storage.get('address')

    this.wallet = this.wallets.find(wallet => wallet.address === this.address)

    if (!this.wallet) {
      try {
        this.wallet = this.wallets[0]
      } catch (error) {
        //
      }
    }

    if (this.wallet) {
      try {
        this.isLoading = true

        await this.fetchDelegates()

        if (!Object.prototype.hasOwnProperty.call(this.wallet, 'vote')) {
          try {
            const { data } = await walletApi.peers.current.get(`wallets/${this.wallet.address}`)
            this.wallet.vote = data.vote
          } catch (error) {
            walletApi.alert.error('Failed to fetch wallet vote')
          }
        }

        this.calculateTableData()
      } catch (error) {
        walletApi.alert.error('Failed to fetch delegate data')
      } finally {
        this.isLoading = false
      }
    }
  },

  computed: {
    logoImage () {
      return ImageService.image('logo')
    },

    profile () {
      return walletApi.profiles.getCurrent()
    },

    wallets () {
      return this.profile.wallets
    },

    hasWallets () {
      return !!(this.wallets && this.wallets.length)
    },

    hasWrongNetwork () {
      return this.profile.network.token !== 'ARK'
    },

    options () {
      return walletApi.storage.getOptions()
    }
  },

  methods: {
    async handleEvent ({ component, event, options }) {
      try {
        await this[`__handle${component}Event`](event, options)
      } catch (error) {
        console.log(`Missing event handler for component: ${component}`)
      }
    },

    async __handleHeaderEvent (event, options) {
      if (event === 'addressChange') {
        this.address = options.address

        // TODO: move to watcher in future version
        walletApi.storage.set('address', this.address)

        const wallet = this.wallets.find(wallet => wallet.address === this.address)

        if (this.wallet.vote === undefined) {
          try {
            const { data } = await walletApi.peers.current.get(`wallets/${this.address}`)
            this.wallet.vote = data.vote
          } catch (error) {
            walletApi.alert.error('Failed to fetch wallet vote')
          }
        }

        this.calculateTableData()
      }
    },

    __handleDelegateTableEvent (event, options) {
      if (event === 'openDelegateModal') {
        this.showDelegateModal = true

        const delegate = this.delegates.find(delegate => delegate.name === options.name)

        this.selectedDelegate = {
          ...delegate,
          votes: Number(delegate.votes) - Number(this.wallet.balance)
        }
      }
    },

    __handleDelegateModalEvent (event, options) {
      if (event === 'close') {
        this.showDelegateModal = false
        this.selectedDelegate = null
      }
    },

    __handleDisclaimerModalEvent (event) {
      if (event === 'cancel') {
        this.goTo('dashboard')
      } else if (event === 'confirm') {
        walletApi.storage.set('hasAcceptedDisclaimer', true)
      }
    },

    goTo (route) {
      walletApi.route.goTo(route)
    },

    async fetchDelegates () {
      const { body } = await walletApi.http.get('https://arkdelegates.live/api/delegates', {
        query: {
          limit: 51
        },
        json: true
      })

      this.delegateData = body.data.map(delegate => {
        return {
          rank: delegate.rank,
          name: delegate.name,
          votes: delegate.delegateStatistics.voting_power,
          publicKey: delegate.public_key,
          website: delegate.website,
          contributions: {
            count: delegate.contributionsCount,
            last: delegate.days_since_last_contribution,
            status: delegate.contribution_status
          },
          payout: {
            percentage: delegate.payout_percent,
            interval: delegate.payout_interval,
            minimum: (delegate.payout_minimum && delegate.payout_minimum !== "0") ? delegate.payout_minimum : null,
            maximum: (delegate.payout_maximum && delegate.payout_maximum !== "0") ? delegate.payout_maximum : null,
            minVotes: (delegate.payout_minimum_vote_amount && delegate.payout_minimum_vote_amount !== "0") ? delegate.payout_minimum_vote_amount : null,
            maxVotes: (delegate.payout_maximum_vote_amount && delegate.payout_maximum_vote_amount !== "0") ? delegate.payout_maximum_vote_amount : null
          },
          isPrivate: delegate.is_private,
          isClaimed: delegate.is_claimed
        }
      })
    },

    calculateTableData () {
      let delegates = this.delegateData.map(delegate => {
        const newDelelegate = {
          ...delegate,
          isVoted: delegate.publicKey === this.wallet.vote
        }

        if (!newDelelegate.isVoted) {
          newDelelegate.votes = Number(delegate.votes) + Number(this.wallet.balance)
        }

        newDelelegate.rewards = Number(this.wallet.balance) / Number(delegate.votes) * 422 * delegate.payout.percentage / 100

        return newDelelegate
      })

      const votedDelegate = delegates.find(delegate => delegate.isVoted)

      if (votedDelegate) {
        delegates = delegates.map(delegate => {
          delegate.rewardsDiff = delegate.rewards - votedDelegate.rewards

          return delegate
        })
      }

      this.delegates = delegates
    }
  }
}
