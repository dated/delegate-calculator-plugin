const utils = require('../utils')

module.exports = {
  template: `
    <TableWrapper
      class="w-full"
      :rows="rows"
      :columns="columns"
      :has-pagination="true"
      :current-page="currentPage"
      :per-page="perPage"
      :per-page-dropdown="[51]"
    >
      <template
        slot-scope="data"
      >
        <div v-if="data.column.field === 'name'">
          <div class="flex flex-col">
            <div class="flex items-center">
              <button
                class="flex items-center text-blue hover:underline"
                @click="emitOpenDelegateModal(data.row.name)"
              >
                {{ data.row.name }}
              </button>

              <span
                v-if="data.row.isVoted"
                class="ml-2 bg-red text-white text-xs text-center font-semibold rounded py-1 px-2"
              >
                Voted
              </span>
            </div>

            <div class="flex font-semibold text-xs text-theme-page-text-light">
              <span
                v-if="!data.row.isClaimed"
                v-tooltip="{
                  content: 'The delegate has not claimed his account and the information shown is likely to be inaccurate',
                  trigger: 'hover',
                  classes: 'text-xs max-w-xs',
                  placement: 'right'
                }"
                class="mt-1 pr-1"
              >
                Unclaimed
              </span>

              <div
                v-else
                class="flex mt-1"
              >
                <span
                  v-tooltip="{
                    content: data.row.isPrivate ? 'You may not receive any rewards from this delegate' : '',
                    trigger: 'hover',
                    classes: 'text-xs',
                    placement: 'right'
                  }"
                  class="pr-1"
                >
                  {{ data.row.isPrivate ? 'Private' : 'Public' }}
                </span>

                <span
                  v-if="showContributorStatus(data.row.contributions)"
                  v-tooltip="{
                    content: getContributionsTooltip(data.row.contributions.last),
                    trigger: 'hover',
                    classes: 'text-xs',
                    placement: 'right'
                  }"
                  class="ml-1 pl-2 pr-1 border-l border-theme-line-separator"
                >
                  {{ getContributionsStatus(data.row.contributions.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="data.column.id === 'daily-rewards'"
          class="flex flex-col"
        >
          {{ data.row.rewards ? data.row.rewards.toFixed(8) : 'None' }}
          <span
            v-if="data.row.rewardsDiff"
            class="mt-1 font-semibold text-xs"
            :class="data.row.rewardsDiff < 0 ? 'text-red' : 'text-green'"
          >
            <span v-if="data.row.rewardsDiff > 0">+</span>{{ data.row.rewardsDiff.toFixed(8) }}
          </span>
        </div>

        <div
          v-else-if="data.column.id === 'weekly-rewards'"
          class="flex flex-col"
        >
          {{ data.row.rewards ? (data.row.rewards * 7).toFixed(8) : 'None' }}
          <span
            v-if="data.row.rewardsDiff"
            class="mt-1 font-semibold text-xs"
            :class="data.row.rewardsDiff < 0 ? 'text-red' : 'text-green'"
          >
            <span v-if="data.row.rewardsDiff > 0">+</span>{{ (data.row.rewardsDiff * 7).toFixed(8) }}
          </span>
        </div>

        <span v-else-if="data.column.field === 'payout.percentage'">
          {{ data.row.payout.percentage }}%
        </span>

        <span v-else-if="data.column.field === 'payout.interval'">
          {{ data.row.payout.interval }}h
        </span>

        <span v-else>
          {{ data.formattedRow[data.column.field] }}
        </span>
      </template>
    </TableWrapper>
  `,

  props: {
    rows: {
      type: Array,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    },
    perPage: {
      type: Number,
      required: true
    },
    callback: {
      type: Function,
      required: true
    }
  },

  computed: {
    columns () {
      return [
        {
          label: 'Name',
          field: 'name'
        },
        {
          id: 'daily-rewards',
          label: 'Daily Rewards',
          field: (row) => row.rewards,
          type: 'number'
        },
        {
          id: 'weekly-rewards',
          label: 'Weekly Rewards',
          field: (row) => row.rewards,
          type: 'number',
        },
        {
          label: 'Payout',
          field: 'payout.percentage',
          type: 'number'
        },
        {
          label: 'Interval',
          field: 'payout.interval',
          type: 'number'
        }
      ]
    },

    profile () {
      return walletApi.profiles.getCurrent()
    }
  },

  methods: {
    executeCallback (event, options) {
      this.callback({
        component: 'DelegateTable',
        event,
        options
      })
    },

    emitOpenDelegateModal (name) {
      this.executeCallback('openDelegateModal', { name })
    },

    showContributorStatus ({ count, status }) {
      return count && status !== 'inactive'
    },

    getContributionsTooltip (last) {
      switch (last) {
        case 0:
          return 'The last contribution was published today'
        case 1:
          return `The last contribution was published ${last} day ago`
        default:
          return `The last contribution was published ${last} days ago`
      }
    },

    getContributionsStatus (status) {
      return `${utils.upperFirst(status)} Contributor`
    }
  }
}
