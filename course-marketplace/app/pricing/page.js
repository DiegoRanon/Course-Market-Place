export default function Pricing() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that's right for you and start learning today.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900">Free</h2>
              <p className="mt-4 text-sm text-gray-500">
                Perfect for getting started with online learning.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <button className="mt-8 block w-full bg-gray-800 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900">
                Get started
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">
                What's included
              </h3>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Access to 5 free courses</span>
                </li>
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Basic progress tracking</span>
                </li>
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Community forum access</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900">Pro</h2>
              <p className="mt-4 text-sm text-gray-500">
                Best for serious learners who want unlimited access.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$29</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <button className="mt-8 block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">
                Start free trial
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">
                What's included
              </h3>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Unlimited course access</span>
                </li>
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Advanced progress tracking</span>
                </li>
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Downloadable certificates</span>
                </li>
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Priority support</span>
                </li>
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Offline course access</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900">Enterprise</h2>
              <p className="mt-4 text-sm text-gray-500">
                For teams and organizations that need advanced features.
              </p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$99</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <button className="mt-8 block w-full bg-gray-800 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900">
                Contact sales
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">
                What's included
              </h3>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Team management</span>
                </li>
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Advanced analytics</span>
                </li>
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Custom integrations</span>
                </li>
                <li className="flex space-x-3">
                  <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">Dedicated support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900">Frequently asked questions</h3>
          <div className="mt-8 max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-medium text-gray-900">Can I cancel my subscription anytime?</h4>
              <p className="mt-2 text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-medium text-gray-900">Do you offer refunds?</h4>
              <p className="mt-2 text-gray-600">
                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="text-lg font-medium text-gray-900">Can I switch between plans?</h4>
              <p className="mt-2 text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 