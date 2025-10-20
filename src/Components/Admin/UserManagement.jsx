import React, { useState, useEffect } from "react";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { Label } from "@/Components/UI/shadcn-UI/label";
import { Search, MoreVertical, Plus, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/UI/shadcn-UI/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/UI/shadcn-UI/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/UI/shadcn-UI/dropdown-menu";
import {
  AddNewUser,
  DeleteUser,
  GetAllUsers,
} from "@/Handlers/AdminUserManagement";

const UserManagement = () => {
  // Sample user data - replace with actual API call
  const [users, setUsers] = useState([
    {
      fname: "John Doe",
      lname: "John Doe",
      email: "john@gmail.com",
      phone_number: "1234567890",
      role: "Admin",
      timestamp: "2023-10-01T12:00:00Z",
      status: "Active",
      _id: "1234567890",
    },
  ]);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userForm, setUserForm] = useState({
    fname: "",
    lname: "",
    email: "john@gmail.com",
    phone_number: "1234567890",
    role: "Admin",
    timestamp: new Date().toISOString(),
    status: "Active",
    _id: "1234567890",
    password: "",
  });

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =        
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
                

    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesStatus = statusFilter ? user.status === statusFilter : true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  useEffect(() => {
    const GetUsers = async () => {
      try {
        const users = await GetAllUsers();
        // console.log(users);
        if (users.status === "success") {
          const mappedUsers = users.data.map((user) => ({
            name: `${user.fname} ${user.lname}`,
            role: user.is_admin ? "Admin" : "User",
            status: "Active",
            email: user.email,
            phone_number: user.phone_number,
            timestamp: user.timestamp,
            _id: user._id,
          }));

          setUsers(mappedUsers);
          // console.log("Recent Users:", mappedUsers);
        } else {
          console.error("Error fetching users:", users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    GetUsers();
  }, []);

  useEffect(() => {
    if (isUserDialogOpen && currentUser) {
      setUserForm(currentUser);
    } else if (isUserDialogOpen) {
      setUserForm({ fname : "", lname : "", email: "", phone_number : "",role: "User", status: "Active" });
    }
  }, [isUserDialogOpen, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentUser) {
      setUsers(
        users.map((user) =>
          user.id === currentUser.id
            ? { ...userForm, id: currentUser.id }
            : user
        )
      );
    } else {
      try {
        const response = await AddNewUser(userForm);
        if (response.status === "success") {
          // console.log("User created successfully");
          setUsers([...users, { id: Date.now(), ...userForm, lastLogin: "-" }]);
        } else {
          console.error("Error creating user:", response);
        }
      } catch (error) {
        console.error("Error creating user:", error);
      }
    }
    setIsUserDialogOpen(false);
  };

  const handleDeleteUser = async (id) => {
    try {
        // console.log(id);
      const response = await DeleteUser(id);
      if (response.status === "success") {
        console.log("User deleted successfully");
        setUsers(users.filter((user) => user.id !== id));
        setIsDeleteDialogOpen(false);
      } else {
        console.error("Error deleting user:", response);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">User Management</CardTitle>
              <CardDescription>
                Manage users, permissions, and roles
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setCurrentUser(null);
                setIsUserDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center justify-center ">
              <Label htmlFor="role" className="text-sm">
                Role
              </Label>
              <select
                name="role"
                id="role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className=" border rounded-md p-2 w-32 h-10"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Loading users...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone_number}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "Admin" ? "destructive" : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "Active" ? "success" : "secondary"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {
                          new Date(user.timestamp)
                            .toLocaleString()
                            .split(",")[0]
                        }
                        <br />
                        {
                          new Date(user.timestamp)
                            .toLocaleString()
                            .split(",")[1]
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentUser(user);
                                setIsUserDialogOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setCurrentUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <p className="text-muted-foreground">No users found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardFooter>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {currentUser
                ? "Update user details and permissions."
                : "Add a new user to the system."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fname">First Name</Label>
                <Input
                  id="fname"
                  value={userForm.fname}
                  onChange={(e) =>
                    setUserForm({ ...userForm, fname: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lname">Last Name</Label>
                <Input
                  id="lname"
                  value={userForm.lname}
                  onChange={(e) =>
                    setUserForm({ ...userForm, lname: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone_number">Mobile Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  placeholder="1234567890"
                  type="tel"
                  value={userForm.phone_number}
                  onChange={(e) =>
                    setUserForm({ ...userForm, phone_number: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={userForm.password || ""}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  required={!currentUser}
                  placeholder={
                    currentUser ? "Leave blank to keep unchanged" : ""
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value })
                  }
                  className="border rounded-md p-2"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {currentUser ? "Update User" : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentUser?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteUser(currentUser?._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
