### Everyone loves statuses

One of the most omnipresent aspects of today's social web is the idea of a status update. All of the three largest social networks, namely Facebook, Twitter and Google+ implement the idea of a simple update, often accompanied with media such as images and/or links. And all of these services also offer a 'timeline' to read the most recent updates important to you.

Each social network uses a different model to determine what updates land in your timeline. Facebook connects people through friendships, Twitter uses the follower/following model and Google+ implements the idea of circles. I personally prefer the Twitter model as it accommodates friends, people who will typically follow each other, and also the idea of influential individuals who will broadcast to many without having to listen to everything from their followers.

### Twitter's control issues

No one would argue that Twitter has not been influential in the past few years. It has built an extremely large network and has one of the best APIs in the business. This led developers to build all sorts of great applications on top of the service. However Twitter is a company, and as such it needs to control it's ecosystem to allow it to build a profitable service. This has been evident through a few blog posts, but most specifically this recent post on [delivering a consistent experience](https://dev.twitter.com/blog/delivering-consistent-twitter-experience); the gist of which is: "We want developers to build apps which enrich our service, but we don't want them to copy services we already offer [and which we plan to use to make money]". 

I can't say I find that recent post shocking, they have been slowly moving to controlling the main consumption experience of their service and this seems a likely continuation. From a financial point of view I cannot blame them for what they are doing. However...

### Moving forward

If everyone agrees that status updates are a clear important part of the online social experience why have they always been rooted with a single company. They are used across all sorts of different applications but these apps find themselves using either Facebook or Twitter (most of the time anyways). This makes sense, "go where the audience is", "why reinvent the wheel". But how can we, as a community, move our applications forward if we are always shackled by one of these social giants. It may be cynical of me, but at the end of the day they need to make money and have been using your application to fuel their network; however, if they decide they can make more money without you, your application/company no longer holds any value to them and they get rid of you.

[I am not the first to suggest this](http://inessential.com/2011/03/11/alternative_to_twitter_), but I think we need a protocol, much in the way the web has HTTP. Everyone is free to use HTTP, we can write servers/clients any way we see fit and we can all communicate between each other because we have agreed on a specification.

HTTP isn't perfect, but clearly it works, and has permitted all kinds of growth not owned by a single controlling company. No one can decide that you are no longer allowed to use HTTP. Now why can't we decide on something similar for our social status updates.

### The protocol

I would like to preface this protocol implementation with the fact that it is nothing more than an idea. How I can envision it working, but the main reason for this article is to open a discussion on the topic and to discuss the trade offs of different systems.

The most important thing about the protocol is that it must be __simple__. All complexities such as authorization, spam control, scalability and caching must be left to the implementations. And it must be built on top of engineering practices which are tried and true. Because of this, the implementation I am suggesting is a JSON API interface built on top of HTTP. Here are a few basic concepts important to the protocol:

* The protocol should say as little as possible about the implementation details
* Clients and servers should be able to be developed using any tool or software which can communicate over HTTP
* All updates should be considered public
* The protocol should remain as simple as possible and the implementations should add the new features
* You should be able to host it yourself or use a hosting provider
* Your information should be easily portable if ever you choose to change provider

The API interface is included at the end of this article. Obviously it should be considered a work in progress but it is as simple as I can imagine the protocol while retaining features we have become used to in today's social web.

Every user account should fully implement the API and should be hosted at a base URL. For example at:

* http://openupdates.com/users/example-user/
* http://mywebsite.com/updates/
* http://randomport.ca:8080/

Every API call is name-spaced to the user's base URL, basically this becomes their user ID. Imagine I host my API at http://base/url. All the API endpoints described below are relative to that URL. A user is identified by his URL much in the same way someone today is identified by their e-mail address. 

Update IDs are meant to be unique on a user level, which means two updates could have the same ID if published by two different users (to avoid the need for a central ID server), and when building a database of all updates the unique IDs would simply need to be prepended with the user's base address to avoid duplicates.

If you read the API specifications you will see that it seems very 'read-only'. There is no user management, no follow or unfollow endpoints, no authentication. This is all intentional. These are concerns for every specific implementation, the only thing every implementation must have in common is it must abide by the API endpoints described below, any other features or details are specific to their implementation.

The only URL which is not a GET request is the `POST :user/updates`. This is mainly to ensure a scalable protocol. If every time a user refreshed his feed a GET request needed to be made to every base URL which he follows, this would put a large burden of the server. Instead when a user posts and update, the posting server issues POST request to all his followers' base URLs. "Don't call us, we'll call you".

### The companies

Why am I choosing to build this protocol around a base URL and not a username which is easier to remember? The same reason I believe email has been able to survive so long: there is no controlling entity. A user can choose to host their updates themselves or can use a hosting company. A company can make money by offering competing trade-offs. Imagine the following businesses:

* A company which hosts your updates for free but in turn advertises to you
* A company with very strict values on personal data but costs a little more every month
* A company who only hosts your previous 500 updates until you choose their premium plan
* A client provider with bare minimum features but a free app
* A highly featured client with in-stream ads
* …

My point is this kind of protocol leads the way to an open ecosystem and a free market. Instead I would hope to see extra features provided by apps and business built around the protocol. For example analytics, search and spam control could be provided by different people than the ones who build the servers and clients.

Moving between providers should be really simple, and this should be done with tools already built into HTTP, namely 310 response codes. I realize it is impossible to guarantee that every provider would abide to properly sending 310s when a user decides to move off their service, but this would tarnish a companies reputation, and in an open market this would lead to people choosing a different provider.

### Conclusion

I think the way we deal with status updates online should be very similar to the way email is dealt with, an agreed upon protocol that hosts and clients use to provide various services. This entire post is meant to open the discussion about possible protocols, I chose to design mine as an HTTP API as that is what myself and many web developers understand best today, but I would like to hear counter-points and different possible implementations.

__As an aside, my previous startup Wavo.me just released a new awesome UI, [you should really check it out](https://wavo.me)__

# Status Protocol

## User information

### GET :user/

####HTTP Response Codes

* `200` OK
* `301` Moved Permanently
* `304` Not Modified
* `404` Not Found, :user not found

####Response Body


	{
		"user": "http://base/user/url"
		"username": "example",
		"joined": "2012-07-07T22:26Z",
		"bio": "Description about the account\n Example account",
		"following": 
			[
				"http://first/user",
				"http://second/user"
			],
		"followers":
			[
				"http://first/user",
				"http://third/user"
			]
	}
	
## Update List

### GET :user/updates

####Query parameters
	
* `?since=:id`
* `?from=:id` defaults to the latest
* `?limit=50` defaults to 50, max 1000

####HTTP Response Codes

* `200` OK
* `301` Moved Permanently
* `304` Not Modified
* `404` Not Found, :user not found

####Response Body

	[
		{
			"id": "550e8400-e29b-41d4-a716-446655440000",
			"user": "http://base/user/url",
			"username": "example",
			"date": "2012-07-07T25:26Z"
			"update": "Update message, does not need to include links and is limited in size",
			"long": "Most of the status should be included in the `update` field, this is equivalent
					 to a `More Information` field. Also limited in size, but can allow for much more
					 text than `update`",
			"links": 
				[
					"first link":
						{
							"url": "http://first/link",
							"type": "link"
						},
					"video resource":
						{
							"url": "http://video/link",
							"type": "video"
						}
				],
			"reply_to": null
		},
		{
			"id": "550e8400-e29b-41d4-a716-446655660000",
			"user": "http://base/user/url",
			"username": "example",
			"date": "2012-07-07T25:26Z"
			"update": "A second example update",
			"long": "Most of the status should be included in the `update` field, this is equivalent
					 to a `More Information` field. Also limited in size, but can allow for much more
					 text than `update`",
			"links": 
				[
					"first link":
						{
							"url": "http://first/link",
							"type": "link"
						},
					"video resource":
						{
							"url": "http://video/link",
							"type": "video"
						}
				],
			"reply_to": "http://first/user/updates/550e8400-e29b-41d4-a716-336655660000"
		}
	]

### GET :user/updates/:id

####HTTP Response Codes

* `200` OK
* `301` Moved Permanently
* `304` Not Modified
* `404` Not Found, :user not found

####Response Body

	{
		"id": "550e8400-e29b-41d4-a716-446655440000",
		"user": "http://base/user/url",
		"username": "example",
		"date": "2012-07-07T25:26Z"
		"update": "Update message, does not need to include links and is limited in size",
		"long": "Most of the status should be included in the `update` field, this is equivalent
				 to a `More Information` field. Also limited in size, but can allow for much more
				 text than `update`",
		"links": 
			[
				"first link":
					{
						"url": "http://first/link",
						"type": "link"
					},
				"video resource":
					{
						"url": "http://video/link",
						"type": "video"
					}
			],
		"reply_to": null
	}
		
### POST :user/updates

####Request Headers

* Content-type: application/json

####Request Body

	{
		"id": "550e8400-e29b-41d4-a716-336655440000",
		"user": "http://second/user",
		"username": "second_user",
		"date": "2012-07-07T25:26Z"
		"update": "Latest update in :user's timeline",
		"long": "This means that :user follows second_user and that this update was posted to the
				 :user. This ensures reduced fetching traffic ",
		"links": 
			[
				"first link":
					{
						"url": "http://first/link",
						"type": "link"
					},
				"video resource":
					{
						"url": "http://video/link",
						"type": "video"
					}
			],
		"reply_to": null
	}
	
####HTTP Response Codes

* `201` Created
* `401` Unauthorized, :user does not follow the posted-by user
* `404` Not Found, :user not found

## Timeline

### GET :user/timeline

####Query parameters

* `?since=:id`
* `?from=:id` defaults to the latest
* `?limit=50` defaults to 50, max 1000

####HTTP Response Codes

* `200` OK
* `301` Moved Permanently
* `304` Not Modified
* `404` Not Found, :user not found

####Response Body

	[
		{
			"id": "550e8400-e29b-41d4-a716-336655440000",
			"user": "http://second/user",
			"username": "second_user",
			"date": "2012-07-07T25:26Z"
			"update": "Latest update in :user's timeline",
			"long": "This means that :user follows second_user and that this update was posted to the
					 :user. This ensures reduced fetching traffic ",
			"links": 
				[
					"first link":
						{
							"url": "http://first/link",
							"type": "link"
						},
					"video resource":
						{
							"url": "http://video/link",
							"type": "video"
						}
				],
			"reply_to": null
		},
		{
			"id": "550e8400-e29b-41d4-a716-336655660000",
			"user": "http://first/user",
			"username": "first_user",
			"date": "2012-07-07T25:26Z"
			"update": "A second example update",
			"long": "Most of the status should be included in the `update` field, this is equivalent
					 to a `More Information` field. Also limited in size, but can allow for much more
					 text than `update`",
			"links": 
				[
					"first link":
						{
							"url": "http://first/link",
							"type": "link"
						},
					"video resource":
						{
							"url": "http://video/link",
							"type": "video"
						}
				],
			"reply_to": null
		}
	]
