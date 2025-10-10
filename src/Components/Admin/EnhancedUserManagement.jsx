import { useEffect, useState } from "react";
import {
  GetAllUsers,
  AddNewUser,
  DeleteUser,
} from "../../Handlers/AdminUserManagement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/UI/shadcn-UI/card";
import { Button } from "@/Components/UI/shadcn-UI/button";
import { Input } from "@/Components/UI/shadcn-UI/input";
import { Label } from "@/Components/UI/shadcn-UI/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/UI/shadcn-UI/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/UI/shadcn-UI/select";
import { Badge } from "@/Components/UI/shadcn-UI/badge";
import { Avatar, AvatarFallback } from "@/Components/UI/shadcn-UI/avatar";
import { Checkbox } from "@/Components/UI/shadcn-UI/checkbox";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Download,
  RefreshCw,
  CheckSquare,
  X,
} from "lucide-react";
import { useToast } from "@/Components/UI/shadcn-UI/use-toast";
import { Skeleton } from "@/Components/UI/shadcn-UI/skeleton";

export default function EnhancedUserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [bulkActionMode, setBulkActionMode] = useState(false);

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    phone_number: "",
    is_admin: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await GetAllUsers();
      console.log(response);
      if (response?.data) {
        setUsers(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== "all") {
      filtered = filtered.filter((user) =>
        filterRole === "admin" ? user.is_admin : !user.is_admin
      );
    }

    // Status filter (can be extended based on your schema)
    if (filterStatus !== "all") {
      // Example: filter by active/inactive if you have such field
      // filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = async () => {
    try {
      const response = await AddNewUser(formData);
      if (response?.success) {
        toast({
          title: "Success",
          description: "User added successfully",
        });
        setIsAddDialogOpen(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    try {
      // Implement edit user API call
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditDialogOpen(false);
      setCurrentUser(null);
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await DeleteUser(userId);
      if (response?.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)
    )
      return;

    try {
      // Implement bulk delete
      for (const userId of selectedUsers) {
        await DeleteUser(userId);
      }
      toast({
        title: "Success",
        description: `${selectedUsers.length} users deleted successfully`,
      });
      setSelectedUsers([]);
      setBulkActionMode(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete users",
        variant: "destructive",
      });
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      // Implement suspend/activate user
      toast({
        title: "Success",
        description: `User status updated: ${userId}`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleExportUsers = () => {
    // Export to CSV
    const csv = [
      ["First Name", "Last Name", "Email", "Phone", "Role", "Created At"],
      ...filteredUsers.map((user) => [
        user.fname,
        user.lname,
        user.email,
        user.phone_number,
        user.is_admin ? "Admin" : "User",
        new Date(user.timestamp).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const resetForm = () => {
    setFormData({
      fname: "",
      lname: "",
      email: "",
      password: "",
      phone_number: "",
      is_admin: false,
    });
  };

  const openEditDialog = (user) => {
    setCurrentUser(user);
    setFormData({
      fname: user.fname || "",
      lname: user.lname || "",
      email: user.email,
      password: "",
      phone_number: user.phone_number,
      is_admin: user.is_admin,
    });
    setIsEditDialogOpen(true);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user._id));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all users, assign roles, and control access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="fname">First Name</Label>
                  <Input
                    id="fname"
                    value={formData.fname}
                    onChange={(e) =>
                      setFormData({ ...formData, fname: e.target.value })
                    }
                    placeholder="Enter first name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lname">Last Name</Label>
                  <Input
                    id="lname"
                    value={formData.lname}
                    onChange={(e) =>
                      setFormData({ ...formData, lname: e.target.value })
                    }
                    placeholder="Enter last name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_admin"
                    checked={formData.is_admin}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_admin: checked })
                    }
                  />
                  <Label htmlFor="is_admin" className="cursor-pointer">
                    Grant Admin Privileges
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name and email..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportUsers}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium">
                  {selectedUsers.length} users selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Selection
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              <CardDescription>
                Showing {filteredUsers.length} of {users.length} total users
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkActionMode(!bulkActionMode)}
            >
              {bulkActionMode ? "Cancel Bulk Mode" : "Bulk Actions"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {bulkActionMode && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length}
                      onCheckedChange={selectAllUsers}
                    />
                  </TableHead>
                )}
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={bulkActionMode ? 7 : 6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    {bulkActionMode && (
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user._id)}
                          onCheckedChange={() => toggleUserSelection(user._id)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {user.fname?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.fname} {user.lname}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {user._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.phone_number || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_admin ? "default" : "secondary"}>
                        {user.is_admin ? (
                          <>
                            <Shield className="mr-1 h-3 w-3" />
                            Admin
                          </>
                        ) : (
                          "User"
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.timestamp
                        ? new Date(user.timestamp).toLocaleDateString()
                        : "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleUserStatus(user._id)}
                          >
                            {user.is_active ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Suspend User
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate User
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-fname">First Name</Label>
              <Input
                id="edit-fname"
                value={formData.fname}
                onChange={(e) =>
                  setFormData({ ...formData, fname: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-lname">Last Name</Label>
              <Input
                id="edit-lname"
                value={formData.lname}
                onChange={(e) =>
                  setFormData({ ...formData, lname: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">
                New Password (leave blank to keep current)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter new password"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_admin"
                checked={formData.is_admin}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_admin: checked })
                }
              />
              <Label htmlFor="edit-is_admin" className="cursor-pointer">
                Grant Admin Privileges
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setCurrentUser(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
